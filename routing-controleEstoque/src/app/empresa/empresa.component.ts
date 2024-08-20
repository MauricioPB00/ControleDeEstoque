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
  response: Registro[] = [];
  editModal: TemplateRef<any>;
  modalRef: BsModalRef;
  userId: any;

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
  onEyeClick(user: string, template: TemplateRef<any>): void {
    console.log('Usuário clicado:', user);
    this.userId = user;
    this.modalRef = this.modalService.show(template);

    this.empresaService.getDadosPorUsuario(this.userId).subscribe(
      (data) => {
        this.registros = data;
        console.log(this.registros)
      },
      (error) => {
        this.toastr.error('Erro ao buscar');
      }
    );

  }
  closeModal() {
    this.modalRef.hide();
    const sideBar = document.querySelector('.container');
    if (sideBar) {
      sideBar.classList.remove('side-bar-disabled');
    }
  }
}
