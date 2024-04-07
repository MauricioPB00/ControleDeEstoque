import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { TemplateRef } from '@angular/core';
import { PainelService } from '../AuthService/painel.service';

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
    this.carregarUsuarios()
  }

  carregarUsuarios() {
    console.log('carregarUsuarios')
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


      console.log(usuario, date, hora);

      // aqui colocar verificação de final de semana //


      this.salvarHoraCalculada(date, usuario, hora);
    });

    //await this.getHorasCalculadas();
  }

  salvarHoraCalculada(date: any, usuario: any, hora: any) {
    this.painelService.postHorasCalculadas(date, usuario, hora).subscribe(
      (data) => {
        this.response = data;
        this.toastr.success('Usuario Atualizado');
      },
      (error) => {
        this.toastr.error('Usuario Ja atualizado');
      }
    );
  }

  //async getHorasCalculadas(): Promise<void> {
  getHorasCalculadas() {
    this.painelService.getHorasCalculadas().subscribe(
      (data) => {
        this.response = data;
        console.log('response getHorasCalculadas', this.response);
        this.calcularHoraMes();
      },
      (error) => {
        this.toastr.error('Erro ao buscar');
      }
    );
  }


  calcularHoraMes() {
    console.log('calcula hora mes');
    const registrosPorUsuarioMap = new Map<string, any[]>();

    this.response.forEach(registro => {
      const userId = registro.user_id;

      if (!registrosPorUsuarioMap.has(userId)) {
        registrosPorUsuarioMap.set(userId, []);
      }

      registrosPorUsuarioMap.get(userId)!.push(registro);
    });

    registrosPorUsuarioMap.forEach((registros, userId) => {
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
      let hora = `${Math.abs(horas).toString().padStart(2, '0')}:${Math.abs(minutos).toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;

      if (horas < 0 || minutos < 0) {
        hora = '-' + hora;
      }
      const horTrab = registros[0].horTrab;
      const barradeProgresso = this.getProgressBar(hora, horTrab);
      this.registros.push({ userId, mes, hora, barradeProgresso });
      this.salvarHoraMesTrabalhada(hora, userId, mes);
    });
  }
  getProgressBar(hora: string, horTrab: string) {
    const cargaHorariaDiaria = parseInt(horTrab.split(':')[0]) * 60 + parseInt(horTrab.split(':')[1]);
    const cargaHorariaMensal = cargaHorariaDiaria * 25;
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
    return parseInt(percentage.replace('%', ''));
  }

  obterMes(data: string): number {
    const [ano, mes, dia] = data.split('-');
    return parseInt(mes);
  }

  salvarHoraMesTrabalhada(hora: any, userId: any, mes: any) {
    this.painelService.salvarHoraMesTrabalhado(hora, userId, mes).subscribe(
      (data) => {
        this.toastr.success('Sucesso ! Horas calculadas');
      },
      (error) => {
        this.toastr.error('Horas calculadas ja Salvas');
      }
    );
  }
}
