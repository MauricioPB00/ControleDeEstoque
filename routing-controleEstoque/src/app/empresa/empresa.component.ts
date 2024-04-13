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
  selector: 'app-empresa',
  templateUrl: './empresa.component.html',
  styleUrls: ['./empresa.component.css']
})
export class EmpresaComponent {
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

      this.verificaFinalSemana(date, usuario, hora);
    });
    this.toastr.success('Usuario Atualizado');
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
       
      },
      (error) => {
        this.toastr.error('Usuario Ja atualizado');
      }
    );
  }
}
