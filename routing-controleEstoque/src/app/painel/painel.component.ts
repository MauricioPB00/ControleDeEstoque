import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { TemplateRef } from '@angular/core';
import { PainelService } from '../AuthService/painel.service';
import { startOfMonth, endOfMonth, eachDayOfInterval, isSaturday, isSunday, parseISO, isWeekend, getDaysInMonth } from 'date-fns';

@Component({
  selector: 'app-painel',
  templateUrl: './painel.component.html',
  styleUrls: ['./painel.component.css']
})
export class PainelComponent implements OnInit {
  registrosPorUsuarioObjeto: any;

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
      totalHorasDiasSemana: number;
      totalHorasSabado: number;
      totalHorasDomingo: number;
      diasTrabalhados: number;
      diasUteis: number;
      diasFaltados: number;
      horasFaltando: number;
      horasNoMesTrabalhadas: number,
      mes: number,
      ano: number,
      user:string,
      progressBar:string,
    }>();

    data.forEach(registro => {
      const userId = registro.user_id;

      if (!registrosPorUsuarioMap.has(userId)) {
        registrosPorUsuarioMap.set(userId, {
          weekend1: [],
          weekend2: [],
          weekend3: [],
          totalHorasDiasSemana: 0,
          totalHorasSabado: 0,
          totalHorasDomingo: 0,
          diasTrabalhados: 0,
          diasUteis: 0,
          diasFaltados: 0,
          horasFaltando: 0,
          horasNoMesTrabalhadas: 0,
          mes:0,
          ano:0,
          user:'0',
          progressBar:'0',
        });
      }

      const userRegistros = data.filter(reg => reg.user_id === userId);
      registrosPorUsuarioMap.get(userId)!.weekend1 = userRegistros.filter(reg => reg.weekend === '1');
      registrosPorUsuarioMap.get(userId)!.weekend2 = userRegistros.filter(reg => reg.weekend === '2');
      registrosPorUsuarioMap.get(userId)!.weekend3 = userRegistros.filter(reg => reg.weekend === '3');
    });

    /*--------------------------------- 3 -------------------------------- */
    registrosPorUsuarioMap.forEach((value, userId) => {
      let totalHorasDomingo = 0;
      value.weekend3.forEach(registro => {

        const timeParts = registro.time.split(':');
        const horas = parseInt(timeParts[0]);
        const minutos = parseInt(timeParts[1]);
        const segundos = parseInt(timeParts[2]);

        totalHorasDomingo += horas + (minutos / 60) + (segundos / 3600);
      });
      value.totalHorasDomingo = totalHorasDomingo;
    });

    /*--------------------------------- 2 -------------------------------- */
    registrosPorUsuarioMap.forEach((value, userId) => {
      let totalHorasSabado = 0;
      value.weekend2.forEach(registro => {

        const timeParts = registro.time.split(':');
        const horas = parseInt(timeParts[0]);
        const minutos = parseInt(timeParts[1]);
        const segundos = parseInt(timeParts[2]);

        totalHorasSabado += horas + (minutos / 60) + (segundos / 3600);
      });
      value.totalHorasSabado = totalHorasSabado;
    });

    /*--------------------------------- 1 -------------------------------- */
    registrosPorUsuarioMap.forEach((value, userId) => {
      let totalHorasDiasSemana = 0;
      let horasNoMesTrabalhadas = 0;
      value.weekend1.forEach(registro => {

        const timeParts = registro.time.split(':');
        const horas = parseInt(timeParts[0]);
        const minutos = parseInt(timeParts[1]);
        const segundos = parseInt(timeParts[2]);
        const diasUteis = this.calcularDiasUteisNoMes(value.weekend1)
        const diasTrabalhados = this.contarItensNoArray(value.weekend1);
        const totalHorasTrabalhadasNoDia = horas + (minutos / 60) + (isNaN(segundos) ? 0 : segundos / 3600);
        const HorasParaTrabalhar = this.calcularHoraTrab(value.weekend1)
        
        horasNoMesTrabalhadas += totalHorasTrabalhadasNoDia
        totalHorasDiasSemana += totalHorasTrabalhadasNoDia - HorasParaTrabalhar;
        value.diasTrabalhados = diasTrabalhados;
        value.diasUteis = diasUteis;
        value.user = userId
      });
      const mes = this.obterMes(value.weekend1[0].date);
      const ano = this.obterAno(value.weekend1[0].date);
      value.ano = ano;
      value.mes = mes;
      value.horasNoMesTrabalhadas = horasNoMesTrabalhadas;
      value.totalHorasDiasSemana = totalHorasDiasSemana;
      value.diasFaltados = value.diasUteis - value.diasTrabalhados
      const HorasParaTrabalhar = this.calcularHoraTrab(value.weekend1)
      value.horasFaltando = HorasParaTrabalhar * value.diasFaltados
      value.progressBar = this.calcularBarraProgresso(HorasParaTrabalhar, value.diasUteis, value.horasNoMesTrabalhadas)

    });

    /*---------------------------------   salvar   -------------------------------- */
    const registrosPorUsuario: { [userId: string]: any } = {};
    registrosPorUsuarioMap.forEach((value, userId) => {
      registrosPorUsuario[userId] = value;
    });
    this.salvarHoraMesTrabalhada(registrosPorUsuario)
  }
  
  calcularBarraProgresso(HorasParaTrabalhar: number, diasUteis: number, horasNoMesTrabalhadas: number) {
    const cargaHorariaMensal = HorasParaTrabalhar * diasUteis;
    let percentual = (horasNoMesTrabalhadas / cargaHorariaMensal) * 100;
    const progressBar = `${percentual.toFixed(2)}%`;
    return progressBar;
  }

  parsePercentageToInt(percentage: string): number {
    return parseInt(percentage.replace('%', ''));
  }

  calcularHoraTrab(value: any[]) {
    const horTrabParts = value[0].horTrab.split(':');
    const horasTrabalhadas = parseInt(horTrabParts[0]);
    const minutosTrabalhados = parseInt(horTrabParts[1]);
    const segundosTrabalhados = parseInt(horTrabParts[2]);
    const HorasParaTrabalhar = horasTrabalhadas + (minutosTrabalhados / 60) + (isNaN(segundosTrabalhados) ? 0 : segundosTrabalhados / 3600);
    return HorasParaTrabalhar
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

  contarItensNoArray(array: any[]) {
    return array.length;
  }

  salvarHoraMesTrabalhada(registrosPorUsuario:any){ 
        this.painelService.salvarHoraMesTrabalhado(registrosPorUsuario).subscribe(
      (data) => {
        this.toastr.success('Sucesso ! Horas calculadas');
      },
      (error) => {
        this.toastr.error('Horas calculadas ja Salvas');
      }
    );
  }
}
