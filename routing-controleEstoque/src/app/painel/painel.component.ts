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

@Component({
  selector: 'app-painel',
  templateUrl: './painel.component.html',
  styleUrls: ['./painel.component.css']
})
export class PainelComponent implements OnInit {
  response: Registro[] = [];
  registros: any[] = [];

  constructor(
    private toastr: ToastrService,
    private modalService: BsModalService,
    private painelService: PainelService) { }

  ngOnInit(): void {
  }

  getHorasCalculadas() {
    this.painelService.getHorasCalculadas().subscribe(
      (data) => {
        this.calcularHoraMes(data)
      },
      (error) => {
        this.toastr.error('Erro ao buscar');
      }
    );
  }

  calcularHoraMes(data: any[]) {
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
