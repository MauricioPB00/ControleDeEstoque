import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { AprovarService } from '../AuthService/aprovar.service';

interface Registro {
  id: number;
  date: string;
  time: string;
  update: string;
  user_id: string;
  horaeditada: string;
  insert: string;
}

@Component({
  selector: 'app-aprovar-update',
  templateUrl: './aprovar-update.component.html',
  styleUrls: ['./aprovar-update.component.css']
})
export class AprovarUpdateComponent {
  constructor(
    private aprovarService: AprovarService,
    private toastr: ToastrService,) { }

  registros: Registro[] = [];
  registrosAtualizadosUpdate: Registro[] = [];
  mostrarTodasAsLinhas = false;

  ngOnInit(): void {
    this.getTimeApprove();
  }

  getTimeApprove() {
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

  processarRegistros() {
    const registrosAtualizadosComHoraIgual = this.registros.filter(registro => {
      return registro.update === 'Update' && registro.time === registro.horaeditada && registro.insert === null;
    });
    const idsRegistrosAtualizadosComHoraIgual = registrosAtualizadosComHoraIgual.map(registro => registro.id);
    this.aprovarService.patchTimeApproveUpdateIquals(idsRegistrosAtualizadosComHoraIgual).subscribe(
      (response) => {
        this.processarRegistrosInsert()
      },
      (error) => {
        console.error('Erro na solicitação PATCH:', error);
      }
    );
  }

  processarRegistrosInsert() {
    this.registrosAtualizadosUpdate = this.registros.filter(registro => {
      return registro.update === 'Update' && registro.time !== registro.horaeditada
    });
  }

}