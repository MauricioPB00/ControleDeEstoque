import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { TemplateRef } from '@angular/core';
import { PainelService } from '../AuthService/painel.service';
import { startOfMonth, endOfMonth, eachDayOfInterval, isSaturday, isSunday, parseISO, isWeekend, getDaysInMonth } from 'date-fns';
import { processarHorasCalculadas } from '../models/calculaHoraProMes';
import { processarRegistros } from '../models/calcularHoraPorDia'
import { FeriadoService } from '../AuthService/feriado.service';


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
  modalRef: BsModalRef;
  mostrarAviso: boolean = true;
  botoesHabilitados: boolean = false;
  registrosPorUsuarioObjeto: any;
  response: Registro[] = [];
  registros: any[] = [];
  registrosPorUsuario: RegistroPorUsuario[] = [];
  editModal: TemplateRef<any>;
  mesesDoAno: { nome: string, numero: number }[];
  ano: number;
  mesAtual: number;
  diasNoMes: Array<number | null> = [];
  feriados: string[] = [];
  datasSalvas: string[] = [];

  constructor(
    private toastr: ToastrService,
    private modalService: BsModalService,
    private painelService: PainelService,
    private feriadoService: FeriadoService
  ) {
    const hoje = new Date();
    this.ano = hoje.getFullYear();
    this.mesAtual = hoje.getMonth();
    this.mesesDoAno = this.getMesesDoAno();
    this.atualizarDiasNoMes();
  }

  ngOnInit(): void {
    this.buscarDatasSalvas();
  }

  getHorasCalculadas() {
    this.painelService.getHorasCalculadas().subscribe(
      (data) => {
        processarHorasCalculadas(this.toastr, this.painelService);
        console.log(data)
      },
      (error) => {
        this.toastr.error('Erro ao buscar');
      }
    );
  }
  atualizarHoraTrabalhista() {
    this.painelService.getHoras().subscribe(
      (data) => {
        this.response = data;
        console.log(this.response);
        processarRegistros(this.response, this.toastr, this.painelService);
      },
      (error) => {
        this.toastr.error('Erro ao buscar');
      }
    );
  }
  ocultarAviso() {
    this.botoesHabilitados = true;
    this.mostrarAviso = false;
  }

  closeModal() {
    this.modalRef.hide();
    const sideBar = document.querySelector('.container');
    if (sideBar) {
      sideBar.classList.remove('side-bar-disabled');
    }
  }


  openEditModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template);
  }
  
  buscarDatasSalvas() {
    this.feriadoService.buscarFeriados().subscribe(
      (datas: string[]) => {
        this.feriados = datas;
        console.log('Datas salvas:', this.feriados);
      },
      (error) => {
        console.error('Erro ao buscar datas salvas:', error);
      }
    );
  }

  mesAnterior() {
    if (this.mesAtual === 0) {
      this.mesAtual = 11;
      this.ano--;
    } else {
      this.mesAtual--;
    }
    this.atualizarDiasNoMes();
  }

  proximoMes() {
    if (this.mesAtual === 11) {
      this.mesAtual = 0;
      this.ano++;
    } else {
      this.mesAtual++;
    }
    this.atualizarDiasNoMes();
  }

  getMesesDoAno(): { nome: string, numero: number }[] {
    return [
      { nome: 'Janeiro', numero: 0 },
      { nome: 'Fevereiro', numero: 1 },
      { nome: 'Março', numero: 2 },
      { nome: 'Abril', numero: 3 },
      { nome: 'Maio', numero: 4 },
      { nome: 'Junho', numero: 5 },
      { nome: 'Julho', numero: 6 },
      { nome: 'Agosto', numero: 7 },
      { nome: 'Setembro', numero: 8 },
      { nome: 'Outubro', numero: 9 },
      { nome: 'Novembro', numero: 10 },
      { nome: 'Dezembro', numero: 11 }
    ];
  }

  isFimDeSemana(dia: number): boolean {
    const data = new Date(this.ano, this.mesAtual, dia);
    const diaDaSemana = data.getDay();
    return diaDaSemana === 0 || diaDaSemana === 6;
  }

  isDiaAtual(dia: number): boolean {
    const hoje = new Date();
    return dia === hoje.getDate() && this.mesAtual === hoje.getMonth();
  }

  atualizarDiasNoMes() {
    const diasNoMes = new Date(this.ano, this.mesAtual + 1, 0).getDate();
    const primeiroDiaSemana = new Date(this.ano, this.mesAtual, 1).getDay();

    this.diasNoMes = [];

    for (let i = 0; i < primeiroDiaSemana; i++) {
      this.diasNoMes.push(null);
    }

    for (let dia = 1; dia <= diasNoMes; dia++) {
      this.diasNoMes.push(dia);
    }
  }

  formatDate(ano: number, mes: number, dia: number): string {
    return ano + '-' + ('0' + (mes + 1)).slice(-2) + '-' + ('0' + dia).slice(-2);
  }

  isDiaClicado(ano: number, mes: number, dia: number): boolean {
    const formattedDate = this.formatDate(ano, mes, dia);
    return this.feriados.includes(formattedDate);
  }


  onDayClick(ano: number, mes: number, dia: number) {
    const formattedDate = this.formatDate(ano, mes, dia);
    const index = this.feriados.indexOf(formattedDate);
    if (index !== -1) {
      this.feriados.splice(index, 1);
    } else {
      this.feriados.push(formattedDate);
    }
    console.log('Datas clicadas:', this.feriados);
  }


  salvarDiasSelecionados() {
    console.log('Dias selecionados:', this.feriados);
    // Por exemplo:
    this.feriadoService.salvarDiasSelecionados(this.feriados).subscribe(
      (response) => {
        console.log('Dias salvos com sucesso!');
      },
      (error) => {
        console.error('Erro ao salvar os dias:', error);
      }
    );
  }
}
