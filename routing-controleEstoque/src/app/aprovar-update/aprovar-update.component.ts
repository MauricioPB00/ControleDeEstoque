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
  removerLinha?: boolean;
  file: string;
  name: string;
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
        this.processarRegistrosUpdate()
      },
      (error) => {
        console.error('Erro na solicitação PATCH:', error);
      }
    );
  }

  processarRegistrosUpdate() {
    this.registrosAtualizadosUpdate = this.registros.filter(registro => {
      return registro.update === 'Update' && registro.time !== registro.horaeditada && registro.insert === null;
    });
    this.registrosAtualizadosUpdate.sort((a, b) => {
      const userIdA = parseInt(a.user_id);
      const userIdB = parseInt(b.user_id);
      return userIdA - userIdB;
    });
  }

  removerIdGrid(index: number) {
    const idRemovido = this.registrosAtualizadosUpdate[index].id;
    const idIndex = this.idsRemovidos.indexOf(idRemovido);

    if (idIndex !== -1) {
      this.idsRemovidos.splice(idIndex, 1);
      this.registrosAtualizadosUpdate[index].removerLinha = false;
    } else {
      this.idsRemovidos.push(idRemovido);
      this.registrosAtualizadosUpdate[index].removerLinha = true;
    }

  }

  aprovar() {
    const idsRegistrosAtualizadosComHoraIgual: number[] = [];
    const idsNaoDeletados: number[] = [];

    this.registrosAtualizadosUpdate.forEach((registro, index) => {
      if (registro.removerLinha) {
        idsRegistrosAtualizadosComHoraIgual.push(registro.id);
      } else {
        idsNaoDeletados.push(registro.id);
      }
    });

    this.aprovarService.patchTimeApproveUpdateIquals(idsRegistrosAtualizadosComHoraIgual).subscribe(
      (response) => {
        this.getTimeApprove();
      },
      (error) => {
        console.error('Erro ao aprovar registros:', error);
      }
    );
    this.aprovarService.approveUpdate(idsNaoDeletados).subscribe(
      (response) => {
        this.getTimeApprove();
      },
      (error) => {
        console.error('Erro ao aprovar registros:', error);
      }
    )

  }
}