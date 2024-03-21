import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { AprovarService } from '../AuthService/aprovar.service';

interface Registro {
  id: number;
  date: string;
  time: string;
  insert: string;
  user_id: string;
  horaeditada: string;
  update: string;
  removerLinha?: boolean;
  file:string;
  name:string;
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
  registrosAtualizadosInsert: Registro[] = [];
  mostrarTodasAsLinhas = true;
  idsRemovidos: number[] = [];

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
    this.registrosAtualizadosInsert = this.registros.filter(registro => {
      return registro.insert === 'Insert'
    });
    this.registrosAtualizadosInsert.sort((a, b) => {
      const userIdA = parseInt(a.user_id);
      const userIdB = parseInt(b.user_id);
      return userIdA - userIdB;
    });
  }

  removerIdGrid(index: number) {
    const idRemovido = this.registrosAtualizadosInsert[index].id;
    const idIndex = this.idsRemovidos.indexOf(idRemovido);

    if (idIndex !== -1) {
      this.idsRemovidos.splice(idIndex, 1);
      this.registrosAtualizadosInsert[index].removerLinha = false;
    } else {
      this.idsRemovidos.push(idRemovido);
      this.registrosAtualizadosInsert[index].removerLinha = true;
    }

  }

  aprovar() {
    const idsRegistrosAtualizadosComHoraIgual: number[] = [];
    const idsNaoDeletados: number[] = [];

    this.registrosAtualizadosInsert.forEach((registro, index) => {
      if (registro.removerLinha) {
        idsRegistrosAtualizadosComHoraIgual.push(registro.id);
      } else {
        idsNaoDeletados.push(registro.id);
      }
    });


    this.aprovarService.deleteInsertNoApprove(idsRegistrosAtualizadosComHoraIgual).subscribe(
      (response) => {
        this.getTimeApprove();
      },
      (error) => {
        console.error('Erro ao aprovar registros:', error);
      }
    );
    this.aprovarService.approveInsert(idsNaoDeletados).subscribe(
      (response) => {
        this.getTimeApprove();
      },
      (error) => {
        console.error('Erro ao aprovar registros:', error);
      }
    )

  }
}



