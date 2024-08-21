import { Component, OnInit } from '@angular/core';
import { EmpresaService } from '../AuthService/empresa.service';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { TemplateRef } from '@angular/core';


interface Registro {
  user: number;
  mes: string;
  ano: string;
  diasFaltados: string;
  diasTrabalhados: string;
  diasUteis: string;
  horasFaltando: string;
  horasNoMesTrabalhadas: string;
  totalHorasDiasSemana: string;
  totalHorasDomingo: string;
  totalHorasSabado: string;
  progressBar: string;
}

interface Usuario {
  id: number;
  nome: string;
  cpf: string;
  rg: string;
  email: string;
  cidade: string;
  job: string;
  horTrab:string;
}


@Component({
  selector: 'app-empresa',
  templateUrl: './empresa.component.html',
  styleUrls: ['./empresa.component.css']
})
export class EmpresaComponent implements OnInit {
  registros: Usuario | null = null;
  userDateTimes = [];
  horasCalculadas: any;
  response: Registro[] = [];
  editModal: TemplateRef<any>;
  modalRef: BsModalRef;
  userId: any;
  groupedTimes: any; 

  constructor(
    private empresaService: EmpresaService,
    private modalService: BsModalService,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.getHorasTrabalhadas();
  }
  
  getHorasTrabalhadas() {
    this.empresaService.getHorasTrabalhadas().subscribe(
      (data: Registro[]) => {
        this.response = this.formatarHoras(data);
        console.log('Dados recebidos:', this.response);
      },
      (error) => {
        console.error('Erro ao buscar horas trabalhadas:', error);
      }
    );
  }

  formatarHoras(data: Registro[]): Registro[] {
    return data.map(registro => ({
      ...registro,
      horasNoMesTrabalhadas: this.formatarNumero(registro.horasNoMesTrabalhadas),
      totalHorasDiasSemana: this.formatarNumero(registro.totalHorasDiasSemana),
      totalHorasDomingo: this.formatarNumero(registro.totalHorasDomingo),
      totalHorasSabado: this.formatarNumero(registro.totalHorasSabado),
    }));
  }

  formatarNumero(numero: string): string {
    return parseFloat(numero).toFixed(2);
  }
  parsePercentageToInt(percentage: string): number {
    return parseInt(percentage.replace('%', ''), 10);
  }
  closeModal() {
    this.modalRef.hide();
    const sideBar = document.querySelector('.container');
    if (sideBar) {
      sideBar.classList.remove('side-bar-disabled');
    }
  }


  onEyeClick(user: string, template: TemplateRef<any>): void {
    console.log('Usuário clicado:', user);
    this.userId = user;
    this.modalRef = this.modalService.show(template);

    this.empresaService.getDadosPorUsuario(this.userId).subscribe(
      (data) => {
        this.registros = data.userData;
        this.userDateTimes = data.userDateTimes;
        this.horasCalculadas = data.horasCalculadas[0];

        this.groupedTimes = this.groupByDate(this.userDateTimes);

        console.log(this.registros, this.groupedTimes);
      },
      (error) => {
        this.toastr.error('Erro ao buscar');
      }
    );
  }

  groupByDate(times: any[]): { [key: string]: { times: string[], dayOfWeek: string } } {
    const grouped: { [key: string]: { times: string[], dayOfWeek: string } } = {};
  
    times.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
    times.forEach(time => {
      const date = time.date;
      
      const dateObj = new Date(`${date}T00:00:00`);
      const dayOfWeek = dateObj.toLocaleDateString('pt-BR', { weekday: 'long' });
  
      if (!grouped[date]) {
        grouped[date] = { times: [], dayOfWeek: '' };
      }
  
      grouped[date].times.push(time.time);
      grouped[date].dayOfWeek = dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1);
    });
  
    Object.keys(grouped).forEach(date => {
      grouped[date].times.sort(); 
    });
  
    return grouped;
  }
  
  objectKeys(obj: any): string[] {
    return Object.keys(obj);
  }
}


