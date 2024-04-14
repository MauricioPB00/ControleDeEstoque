import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { TemplateRef } from '@angular/core';
import { PainelService } from '../AuthService/painel.service';
import { startOfMonth, endOfMonth, eachDayOfInterval, isSaturday, isSunday, parseISO, isWeekend, getDaysInMonth } from 'date-fns';
import { processarHorasCalculadas } from '../models/calculaHoraProMes';
import { processarRegistros } from '../models/calcularHoraPorDia'

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
  registrosPorUsuarioObjeto: any;
  response: Registro[] = [];
  registros: any[] = [];
  registrosPorUsuario: RegistroPorUsuario[] = [];


  constructor(
    private toastr: ToastrService,
    private modalService: BsModalService,
    private painelService: PainelService) { }

  ngOnInit(): void {
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

  
}
