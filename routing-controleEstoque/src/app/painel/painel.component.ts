import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { TemplateRef } from '@angular/core';
import { PainelService } from '../AuthService/painel.service';
import { startOfMonth, endOfMonth, eachDayOfInterval, isSaturday, isSunday, parseISO, isWeekend, getDaysInMonth } from 'date-fns';


interface Registro {
  id: number;
  date: string;
  time: string;
  user_id: string;
  horTrab: string;
  barradeProgresso: string;
}

interface RegistroPorUsuario {
  userId: string;
  registros: Registro[];
  totalHorasTrabalhadas?: string;
}

@Component({
  selector: 'app-painel',
  templateUrl: './painel.component.html',
  styleUrls: ['./painel.component.css']
})
export class PainelComponent implements OnInit {
  response: Registro[] = [];
  registros: any[] = [];
  registrosPorUsuario: RegistroPorUsuario[] = [];

  constructor(
    private toastr: ToastrService,
    private modalService: BsModalService,
    private painelService: PainelService) { }

  ngOnInit(): void {
  }

  atualizarHoraTrabalhista() {
    this.painelService.getHoras().subscribe(
      (data) => {
        this.response = data;
        console.log(this.response);
        this.organizarRegistrosPorDiaUsuario();
      },
      (error) => {
        this.toastr.error('Erro ao buscar');
      }
    );
  }

  organizarRegistrosPorDiaUsuario() {
    const registrosPorUsuarioMap = new Map<string, Registro[]>();

    this.response.forEach(registro => {
      const userId = registro.user_id;

      if (!registrosPorUsuarioMap.has(userId)) {
        registrosPorUsuarioMap.set(userId, []);
      }

      registrosPorUsuarioMap.get(userId)!.push(registro);
    });

    registrosPorUsuarioMap.forEach(registros => {
      registros.sort((a, b) => {
        if (a.date < b.date) return -1;
        if (a.date > b.date) return 1;
        return 0;
      });
    });

    const registrosOrganizados: RegistroPorUsuario[] = [];

    registrosPorUsuarioMap.forEach((registros, userId) => {
      const registrosPorDiaMap = new Map<string, Registro[]>();

      registros.forEach(registro => {
        const date = registro.date;

        if (!registrosPorDiaMap.has(date)) {
          registrosPorDiaMap.set(date, []);
        }

        registrosPorDiaMap.get(date)!.push(registro);
      });

      const registrosPorDia: RegistroPorUsuario[] = [];

      registrosPorDiaMap.forEach((registros, date) => {
        registrosPorDia.push({ userId, registros });
      });

      registrosOrganizados.push(...registrosPorDia);
    });

    this.registrosPorUsuario = registrosOrganizados.sort((a, b) => {
      if (a.registros[0].date < b.registros[0].date) return -1;
      if (a.registros[0].date > b.registros[0].date) return 1;
      return 0;
    });
    this.calcularHorasTrabalhadasPorDia();
  }

  async calcularHorasTrabalhadasPorDia(): Promise<void> {
    this.registrosPorUsuario.forEach(async registrosPorUsuario => {
      let totalMilissegundos = 0;

      registrosPorUsuario.registros.sort((a, b) => {
        const horaA = new Date('1970-01-01T' + a.time).getTime();
        const horaB = new Date('1970-01-01T' + b.time).getTime();
        return horaA - horaB;
      });

      const registros = registrosPorUsuario.registros;

      if (registros.length % 2 !== 0) {
        console.error('Número ímpar de registros para o usuário', registrosPorUsuario.userId);
        return;
      }

      for (let i = 0; i < registros.length; i += 2) {
        const horaEntrada = new Date('1970-01-01T' + registros[i].time).getTime();
        const horaSaida = new Date('1970-01-01T' + registros[i + 1].time).getTime();

        totalMilissegundos += Math.abs(horaSaida - horaEntrada);
      }
      const horas = Math.floor(totalMilissegundos / (1000 * 60 * 60));
      const minutos = Math.floor((totalMilissegundos % (1000 * 60 * 60)) / (1000 * 60));

      registrosPorUsuario.totalHorasTrabalhadas = `${horas}:${minutos < 10 ? '0' : ''}${minutos}`;

      const date = registros[0].date;
      const usuario = registrosPorUsuario.userId;
      const hora = registrosPorUsuario.totalHorasTrabalhadas;


      console.log('xxxxxx', usuario, date, hora);

      this.verificaFinalSemana(date, usuario, hora);
    });

    //await this.getHorasCalculadas();
  }

  verificaFinalSemana(date: string, usuario: string, hora: string) {
    const dateToCheck = parseISO(date);
    if (isSaturday(dateToCheck)) {
      const weekend = '2'
      this.salvarHoraCalculada(date, usuario, hora, weekend)
    } else if (isSunday(dateToCheck)) {
      const weekend = '3'
      this.salvarHoraCalculada(date, usuario, hora, weekend)
    } else {
      const weekend = '1'
      this.salvarHoraCalculada(date, usuario, hora, weekend)
    }
  }

  salvarHoraCalculada(date: any, usuario: any, hora: any, weekend: any) {
    this.painelService.postHorasCalculadas(date, usuario, hora, weekend).subscribe(
      (data) => {
        this.response = data;
        this.toastr.success('Usuario Atualizado');
      },
      (error) => {
        this.toastr.error('Usuario Ja atualizado');
      }
    );
  }

  getHorasCalculadas() {
    this.painelService.getHorasCalculadas().subscribe(
      (data) => {
        const dataIgualUm = this.filtrarWeekendsIgualUm(data);
        const dataIgualDois = this.filtrarWeekendsIgualDois(data);
        const dataIgualTres = this.filtrarWeekendsIgualTres(data);

        const sabado = this.calcularHoraMesDois(dataIgualDois)
        console.log('sab', sabado)
        const domingo = this.calcularHoraMesTres(dataIgualTres)
        this.calcularHoraMes(dataIgualUm, sabado, domingo)
      },
      (error) => {
        this.toastr.error('Erro ao buscar');
      }
    );
  }

  filtrarWeekendsIgualTres(data: any[]): any[] {
    return data.filter(objeto => objeto.weekend === "3");
  }

  filtrarWeekendsIgualDois(data: any[]): any[] {
    return data.filter(objeto => objeto.weekend === "2");
  }

  filtrarWeekendsIgualUm(data: any[]): any[] {
    return data.filter(objeto => objeto.weekend === "1");
  }




  calcularHoraMesDois(data: any[]) {
    const registrosPorUsuarioMap = new Map<string, any[]>();
    const horasFormatadas: string[] = [];
    data.forEach(registro => {
      const userId = registro.user_id;
      console.log(userId)
      if (!registrosPorUsuarioMap.has(userId)) {
        registrosPorUsuarioMap.set(userId, []);
      }

      registrosPorUsuarioMap.get(userId)!.push(registro);

    });
    registrosPorUsuarioMap.forEach((registros, userId) => {
      let totalMinutosTrabalhados = 0;

      registros.forEach(registro => {
        const horaRegistrada = registro.time.split(':').map(Number);

        const minutosRegistrados = horaRegistrada[0] * 60 + horaRegistrada[1];

        totalMinutosTrabalhados += minutosRegistrados;
      });

      const horas = Math.floor(totalMinutosTrabalhados / 60);
      const minutos = totalMinutosTrabalhados % 60;
      const segundos = 0;
      const horaFormatada = `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;
      console.log('total de horas trabalhadas dom:', horaFormatada, userId);
      horasFormatadas.push(horaFormatada, userId);
    });
    return horasFormatadas;
  }

  calcularHoraMesTres(data: any[]) {
    const horasFormatadas: string[] = [];
    const registrosPorUsuarioMap = new Map<string, any[]>();
    data.forEach(registro => {
      const userId = registro.user_id;
      console.log(userId)
      if (!registrosPorUsuarioMap.has(userId)) {
        registrosPorUsuarioMap.set(userId, []);
      }
      registrosPorUsuarioMap.get(userId)!.push(registro);

    });
    registrosPorUsuarioMap.forEach((registros, userId) => {
      let totalMinutosTrabalhados = 0;

      registros.forEach(registro => {
        const horaRegistrada = registro.time.split(':').map(Number);
        const minutosRegistrados = horaRegistrada[0] * 60 + horaRegistrada[1];

        totalMinutosTrabalhados += minutosRegistrados;
      });

      const horas = Math.floor(totalMinutosTrabalhados / 60);
      const minutos = totalMinutosTrabalhados % 60;
      const segundos = 0;
      const horaFormatada = `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;
      console.log('total de horas trabalhadas sab:', horaFormatada, userId);
      horasFormatadas.push(horaFormatada , userId); 
    });
    return horasFormatadas;
  }









  calcularHoraMes(data: any[], sabado:any, domingo:any) {
    console.log(sabado)
    const registrosPorUsuarioMap = new Map<string, any[]>();

    data.forEach(registro => {
      const userId = registro.user_id;

      if (!registrosPorUsuarioMap.has(userId)) {
        registrosPorUsuarioMap.set(userId, []);
      }

      registrosPorUsuarioMap.get(userId)!.push(registro);
    });
    let numeroDeItens = 0;
    registrosPorUsuarioMap.forEach((registros, userId) => {
      numeroDeItens += registros.length;
      let totalMinutosTrabalhados = 0;

      registros.forEach(registro => {
        const horaTrabalhada = registro.horTrab.split(':').map(Number);
        const minutosTrabalhados = horaTrabalhada[0] * 60 + horaTrabalhada[1];
        const horaRegistrada = registro.time.split(':').map(Number);
        const minutosRegistrados = horaRegistrada[0] * 60 + horaRegistrada[1];
        const diferencaMinutos = minutosRegistrados - minutosTrabalhados;

        totalMinutosTrabalhados += diferencaMinutos;
      });

      const horas = Math.floor(totalMinutosTrabalhados / 60);
      const minutos = totalMinutosTrabalhados % 60;
      const segundos = 0;
      const mes = this.obterMes(registros[0].date);
      const ano = this.obterAno(registros[0].date);
      let hora = `${Math.abs(horas).toString().padStart(2, '0')}:${Math.abs(minutos).toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;

      if (horas < 0 || minutos < 0) {
        hora = '-' + hora;
      }
      console.log('hora 1', hora)
      const primeiroDiaDoMes = new Date(ano, mes - 1, 1);
      const totalDiasNoMes = getDaysInMonth(primeiroDiaDoMes);
      let diasUteis = 0;

      for (let i = 1; i <= totalDiasNoMes; i++) {
        const diaAtual = new Date(ano, mes - 1, i);
        if (!isWeekend(diaAtual)) {
          diasUteis++;
        }
      }

      if (diasUteis === numeroDeItens) {
        const falta = 0
        const horTrab = registros[0].horTrab;
        const barradeProgresso = this.getProgressBar(hora, horTrab, diasUteis);
        this.registros.push({ userId, mes, hora, barradeProgresso, ano, falta });
        this.salvarHoraMesTrabalhada(hora, userId, mes, ano, falta);
      }
      else {
        const horTrab = registros[0].horTrab;
        const horaTrabArray = horTrab.split(':').map(Number);
        const horTrabMinutos = horaTrabArray[0] * 60 + horaTrabArray[1];
        const falta = diasUteis - numeroDeItens;

        let horaArray = hora.split(':').map(Number);
        let totalMinutos = horaArray[0] * 60 + horaArray[1];

        totalMinutos -= horTrabMinutos * falta;

        let horas = Math.floor(Math.abs(totalMinutos) / 60);
        let minutos = Math.abs(totalMinutos) % 60;

        let horaCalculada = `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}:00`;

        if (totalMinutos < 0) {
          horaCalculada = '-' + horaCalculada;
        }
        hora = '0'
        hora = horaCalculada
        const barradeProgresso = this.getProgressBar(hora, horTrab, diasUteis);
        this.registros.push({ userId, mes, hora, barradeProgresso, ano, falta });
        this.salvarHoraMesTrabalhada(hora, userId, mes, ano, falta);
      }
    });
  }

  getProgressBar(hora: string, horTrab: string, diasUteis: any) {
    const cargaHorariaDiaria = parseInt(horTrab.split(':')[0]) * 60 + parseInt(horTrab.split(':')[1]);
    const cargaHorariaMensal = cargaHorariaDiaria * diasUteis;
    const [horas, minutos, segundos] = hora.split(':').map(Number);
    const totalMinutos = horas * 60 + minutos;
    let percentual = (totalMinutos / cargaHorariaMensal) * 100;

    if (percentual >= 0) {
      percentual = 100;
    }

    if (percentual < 0) {
      percentual = 100 + (percentual / 100) * 100;
    }
    const progressBar = `${percentual.toFixed(2)}%`;

    console.log(`Hora: ${hora}, Horário de trabalho diário: ${horTrab}, Carga horária mensal: ${cargaHorariaMensal} minutos, Percentual da barra de progresso: ${progressBar}`);

    return progressBar;
  }

  parsePercentageToInt(percentage: string): number {
    //html usa
    return parseInt(percentage.replace('%', ''));
  }

  obterMes(data: string): number {
    const [ano, mes, dia] = data.split('-');
    return parseInt(mes);
  }
  obterAno(data: string): number {
    const [ano, mes, dia] = data.split('-');
    return parseInt(ano);
  }

  salvarHoraMesTrabalhada(hora: any, userId: any, mes: any, ano: any, falta: any) {
    this.painelService.salvarHoraMesTrabalhado(hora, userId, mes, ano, falta).subscribe(
      (data) => {
        this.toastr.success('Sucesso ! Horas calculadas');
      },
      (error) => {
        this.toastr.error('Horas calculadas ja Salvas');
      }
    );
  }
}
