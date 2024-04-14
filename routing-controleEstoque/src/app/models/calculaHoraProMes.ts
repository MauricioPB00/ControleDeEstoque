import { ToastrService } from 'ngx-toastr';
import { PainelService } from '../AuthService/painel.service';
import { parseISO, isSaturday, isSunday, getDaysInMonth, isWeekend } from 'date-fns';

export function processarHorasCalculadas(toastr: ToastrService, painelService: PainelService) {
  painelService.getHorasCalculadas().subscribe(
    (data: any[]) => {
      calcularHoraMes(data, toastr, painelService);
      console.log(data);
    },
    (error) => {
      toastr.error('Erro ao buscar');
    }
  );
}

function calcularHoraMes(data: any[], toastr: ToastrService, painelService: PainelService) {
  const registrosPorUsuarioMap = new Map<string, any>();

  data.forEach((registro: any) => {
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
        mes: 0,
        ano: 0,
        user: '0',
        progressBar: '0',
      });
    }

    const userRegistros = data.filter(reg => reg.user_id === userId);
    registrosPorUsuarioMap.get(userId)!.weekend1 = userRegistros.filter(reg => reg.weekend === '1');
    registrosPorUsuarioMap.get(userId)!.weekend2 = userRegistros.filter(reg => reg.weekend === '2');
    registrosPorUsuarioMap.get(userId)!.weekend3 = userRegistros.filter(reg => reg.weekend === '3');
  });

  registrosPorUsuarioMap.forEach((value, userId) => {
    let totalHorasDomingo = 0;
    value.weekend3.forEach((registro: any) => {
      const timeParts = registro.time.split(':');
      const horas = parseInt(timeParts[0]);
      const minutos = parseInt(timeParts[1]);
      const segundos = parseInt(timeParts[2]);

      totalHorasDomingo += horas + (minutos / 60) + (segundos / 3600);
    });
    value.totalHorasDomingo = totalHorasDomingo;
  });

  registrosPorUsuarioMap.forEach((value, userId) => {
    let totalHorasSabado = 0;
    value.weekend2.forEach((registro: any) => {
      const timeParts = registro.time.split(':');
      const horas = parseInt(timeParts[0]);
      const minutos = parseInt(timeParts[1]);
      const segundos = parseInt(timeParts[2]);

      totalHorasSabado += horas + (minutos / 60) + (segundos / 3600);
    });
    value.totalHorasSabado = totalHorasSabado;
  });

  registrosPorUsuarioMap.forEach((value, userId) => {
    let totalHorasDiasSemana = 0;
    let horasNoMesTrabalhadas = 0;
    value.weekend1.forEach((registro: any) => {
      const timeParts = registro.time.split(':');
      const horas = parseInt(timeParts[0]);
      const minutos = parseInt(timeParts[1]);
      const segundos = parseInt(timeParts[2]);
      const diasUteis = calcularDiasUteisNoMes(value.weekend1);
      const diasTrabalhados = contarItensNoArray(value.weekend1);
      const totalHorasTrabalhadasNoDia = horas + (minutos / 60) + (isNaN(segundos) ? 0 : segundos / 3600);
      const HorasParaTrabalhar = calcularHoraTrab(value.weekend1);
      
      horasNoMesTrabalhadas += totalHorasTrabalhadasNoDia;
      totalHorasDiasSemana += totalHorasTrabalhadasNoDia - HorasParaTrabalhar;
      value.diasTrabalhados = diasTrabalhados;
      value.diasUteis = diasUteis;
      value.user = userId;
    });
    const mes = obterMes(value.weekend1[0].date);
    const ano = obterAno(value.weekend1[0].date);
    value.ano = ano;
    value.mes = mes;
    value.horasNoMesTrabalhadas = horasNoMesTrabalhadas;
    value.totalHorasDiasSemana = totalHorasDiasSemana;
    value.diasFaltados = value.diasUteis - value.diasTrabalhados;
    const HorasParaTrabalhar = calcularHoraTrab(value.weekend1);
    value.horasFaltando = HorasParaTrabalhar * value.diasFaltados;
    value.progressBar = calcularBarraProgresso(HorasParaTrabalhar, value.diasUteis, value.horasNoMesTrabalhadas);
  });

  const registrosPorUsuario: { [userId: string]: any } = {};
  registrosPorUsuarioMap.forEach((value, userId) => {
    registrosPorUsuario[userId] = value;
  });

  salvarHoraMesTrabalhada(registrosPorUsuario, toastr, painelService);
}

function calcularBarraProgresso(HorasParaTrabalhar: number, diasUteis: number, horasNoMesTrabalhadas: number) {
  const cargaHorariaMensal = HorasParaTrabalhar * diasUteis;
  let percentual = (horasNoMesTrabalhadas / cargaHorariaMensal) * 100;
  const progressBar = `${percentual.toFixed(2)}%`;
  return progressBar;
}

function calcularHoraTrab(value: any[]) {
  const horTrabParts = value[0].horTrab.split(':');
  const horasTrabalhadas = parseInt(horTrabParts[0]);
  const minutosTrabalhados = parseInt(horTrabParts[1]);
  const segundosTrabalhados = parseInt(horTrabParts[2]);
  const HorasParaTrabalhar = horasTrabalhadas + (minutosTrabalhados / 60) + (isNaN(segundosTrabalhados) ? 0 : segundosTrabalhados / 3600);
  return HorasParaTrabalhar;
}

function calcularDiasUteisNoMes(registros: any[]) {
  const primeiroRegistro = registros[0];
  const mes = obterMes(primeiroRegistro.date);
  const ano = obterAno(primeiroRegistro.date);
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

function obterMes(data: string): number {
  const [ano, mes, dia] = data.split('-');
  return parseInt(mes);
}

function obterAno(data: string): number {
  const [ano, mes, dia] = data.split('-');
  return parseInt(ano);
}

function contarItensNoArray(array: any[]) {
  return array.length;
}

function salvarHoraMesTrabalhada(registrosPorUsuario: any, toastr: ToastrService, painelService: PainelService) {
  painelService.salvarHoraMesTrabalhado(registrosPorUsuario).subscribe(
    (data) => {
      toastr.success('Sucesso ! Horas calculadas');
    },
    (error) => {
      toastr.error('Horas calculadas ja Salvas');
    }
  );
}
