import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { AprovarService } from '../AuthService/aprovar.service';

interface Registro {
  id: number;
  date: string;
  time: string;
  editado: string;
  user_id: string;
  horaeditada: string;
}

@Component({
  selector: 'app-aprovar',
  templateUrl: './aprovar.component.html',
  styleUrls: ['./aprovar.component.css']
})
export class AprovarComponent {

  constructor(
    private aprovarService: AprovarService,
    private toastr: ToastrService,) { }

registros: Registro[] = [];

  ngOnInit(): void{
    this.getTimeApprove();
  }

  getTimeApprove(){
    this.aprovarService.getTimeApprove().subscribe(
      (data) => {
        this.registros = data;
        this.processarRegistros();
      },
      (error) => {
        this.toastr.error('Erro ao buscar');
      }
    );
  }

 processarRegistros(): void {
    const registrosAtualizadosComHoraIgual = this.registros.filter(registro => {
      return registro.editado === 'Update' && registro.time === registro.horaeditada;
    });
    const idsRegistrosAtualizadosComHoraIgual = registrosAtualizadosComHoraIgual.map(registro => registro.id);
    this.aprovarService.patchTimeApproveUpdateIquals(idsRegistrosAtualizadosComHoraIgual).subscribe(
      (response) => {
        console.log('Resposta da solicitação PATCH:', response);
      },
      (error) => {
        console.error('Erro na solicitação PATCH:', error);
      }
    );
  }
}
