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
        console.log(data)
      },
      (error) => {
        this.toastr.error('Erro ao buscar');
      }
    );
  }

  calcularHoraMes(data: any[]) {
    const registrosPorUsuarioMap = new Map<string, {
      weekend1: any[]
      weekend2: any[]
      weekend3: any[]
      totalHorasWeekend1: number;
      totalHorasWeekend2: number;
      totalHorasWeekend3: number;
      diasUteis:number
    }>();

    data.forEach(registro => {
      const userId = registro.user_id;

      if (!registrosPorUsuarioMap.has(userId)) {
        registrosPorUsuarioMap.set(userId, {
          weekend1: [],
          weekend2: [],
          weekend3: [],
          totalHorasWeekend1: 0,
          totalHorasWeekend2: 0,
          totalHorasWeekend3: 0,
          diasUteis: 0,
        });
      }

      const userRegistros = data.filter(reg => reg.user_id === userId);

      registrosPorUsuarioMap.get(userId)!.weekend1 = userRegistros.filter(reg => reg.weekend === '1');
      registrosPorUsuarioMap.get(userId)!.weekend2 = userRegistros.filter(reg => reg.weekend === '2');
      registrosPorUsuarioMap.get(userId)!.weekend3 = userRegistros.filter(reg => reg.weekend === '3');
    });


    /*--------------------------------- 2 -------------------------------- */
    registrosPorUsuarioMap.forEach((value, userId) => {
      let totalHorasWeekend2 = 0;
      value.weekend2.forEach(registro => {

        const timeParts = registro.time.split(':');
        const horas = parseInt(timeParts[0]);
        const minutos = parseInt(timeParts[1]);
        const segundos = parseInt(timeParts[2]);

        totalHorasWeekend2 += horas + (minutos / 60) + (segundos / 3600);
      });
      value.totalHorasWeekend2 = totalHorasWeekend2;
      // console.log(`Total de horas no weekend2 para o usuário ${userId}: ${totalHorasWeekend2.toFixed(2)}`);
    });


    /*--------------------------------- 1 -------------------------------- */
    registrosPorUsuarioMap.forEach((value, userId) => {
      let totalHorasWeekend1 = 0;
      let diasmes
      value.weekend1.forEach(registro => {
  
        const timeParts = registro.time.split(':');
        const horas = parseInt(timeParts[0]);
        const minutos = parseInt(timeParts[1]);
        const segundos = parseInt(timeParts[2]);
        const diasUteis = this.calcularDiasUteisNoMes(value.weekend1)
        const totalHorasRegistro = horas + (minutos / 60) + (isNaN(segundos) ? 0 : segundos / 3600);
        const horTrabParts = registro.horTrab.split(':');
        const horasTrabalhadas = parseInt(horTrabParts[0]);
        const minutosTrabalhados = parseInt(horTrabParts[1]);
        const segundosTrabalhados = parseInt(horTrabParts[2]);
        const totalHorasTrabalhadas = horasTrabalhadas + (minutosTrabalhados / 60) + (isNaN(segundosTrabalhados) ? 0 : segundosTrabalhados / 3600);

        totalHorasWeekend1 += totalHorasRegistro - totalHorasTrabalhadas;
        value.diasUteis = diasUteis;
      });
      value.totalHorasWeekend1 = totalHorasWeekend1;
    });

    registrosPorUsuarioMap.forEach((value, userId) => {
      console.log(`weekend1 - usuário ${userId} - totalHoras${value.totalHorasWeekend1.toFixed(2)} - dias uteis  ${value.diasUteis}`);
    });





    /*---------------------------------   console   -------------------------------- */
    const registrosPorUsuarioObjeto: { [userId: string]: any } = {};
    registrosPorUsuarioMap.forEach((value, userId) => {
      registrosPorUsuarioObjeto[userId] = value;
    });
    console.log('bbbbb', registrosPorUsuarioObjeto);

    //   registrosPorUsuarioMap.forEach((value, userId) => {
    //     console.log(value)
    //     console.log(`aaaaaaaaTotal de horas no weekend2 para o usuário ${userId}: ${value.totalHorasWeekend2.toFixed(2)}`);
    //     console.log(`aaaaaaaaTotal de horas no weekend3 para o usuário ${userId}: ${value.totalHorasWeekend3.toFixed(2)}`);
    // });

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

  calcularDiasUteisNoMes(registros: any[]) {
    const primeiroRegistro = registros[0];
    const mes = this.obterMes(primeiroRegistro.date);
    const ano = this.obterAno(primeiroRegistro.date);
    const totalDiasNoMes = getDaysInMonth(new Date(ano, mes - 1));

    let diasUteis = 0;

    for (let i = 1; i <= totalDiasNoMes; i++) {
      const diaAtual = new Date(ano, mes - 1, i);
      if (!isWeekend(diaAtual)) {
        diasUteis++;
      }
    }
    return diasUteis;
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
