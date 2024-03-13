import { Component, OnInit } from '@angular/core';
import { AjusteService } from '../AuthService/ajuste.service';
import { ToastrService } from 'ngx-toastr';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { TemplateRef } from '@angular/core';

interface Registro {
  id: number;
  date: string;
  time: string;
}

interface RegistroGroup {
  date: string;
  registros: Registro[];
}

@Component({
  selector: 'app-ajuste',
  templateUrl: './ajuste.component.html',
  styleUrls: ['./ajuste.component.css']
})
export class AjusteComponent {
  modalRef: BsModalRef;

  constructor(
    private ajusteService: AjusteService,
    private toastr: ToastrService,
    private modalService: BsModalService) { }

  registrosPorDia: RegistroGroup[] = [];
  horasDoDiaSelecionado: string[] = [];
  diaSelecionado: string[] = [];
  editModal: TemplateRef<any>;

  ngOnInit(): void {
    this.getRegistrosAjuste();
  }

  getRegistrosAjuste() {
    const userId = JSON.parse(localStorage.getItem('ControleUsuario') || '{}').id
    if (userId) {
      this.ajusteService.getRegistrosAjuste(userId).subscribe(
        (data: Registro[]) => {
          this.organizarRegistrosPorDia(data);
        },
        (error) => {
          this.toastr.error('Erro ao buscar');
        }
      );
    } else {
      this.toastr.error('Erro ao encontrar o ID');
    }
  }

  organizarRegistrosPorDia(registros: Registro[]) {
    const registrosPorDiaMap = new Map<string, RegistroGroup>();

    registros.forEach(registro => {
      const dateKey = registro.date;
      if (!registrosPorDiaMap.has(dateKey)) {
        registrosPorDiaMap.set(dateKey, { date: dateKey, registros: [] });
      }
      registrosPorDiaMap.get(dateKey)!.registros.push(registro);
    });
    this.registrosPorDia = Array.from(registrosPorDiaMap.values());
  }

  openModal(template: TemplateRef<any>, index: number) {
    this.disableSideBar();
    const group = this.registrosPorDia[index];
    const date = group.date;
    const registrosdata = group.registros.map(registro => registro.date);
    const registros = group.registros.map(registro => registro.time);

    this.modalRef = this.modalService.show(template);
    this.horasDoDiaSelecionado = registros;
    this.diaSelecionado = registrosdata;
  }

  salvarHoras(dataSelecionada: string, horasSelecionadas: string[]) {
    const idsSelecionados: number[] = [];
    const horasSelecionadasStr: string[] = [];
    horasSelecionadas.forEach(horaSelecionada => {
      const registro = this.registrosPorDia.find(group => group.registros.some(registro => registro.time === horaSelecionada));
      if (registro) {
        const registroSelecionado = registro.registros.find(registro => registro.time === horaSelecionada);
        if (registroSelecionado) {
          idsSelecionados.push(registroSelecionado.id);
          horasSelecionadasStr.push(registroSelecionado.time);
        }
      }
    });
    console.log('Data Selecionada:', dataSelecionada);
    console.log('IDs das horas selecionadas:', idsSelecionados);
    console.log('Horas selecionadas:', horasSelecionadasStr);
  }

  disableSideBar() {
    const sideBar = document.querySelector('.container');
    if (sideBar) {
      sideBar.classList.add('side-bar-disabled');
    }
  }

  closeModal() {
    this.modalRef.hide();
    const sideBar = document.querySelector('.container');
    if (sideBar) {
      sideBar.classList.remove('side-bar-disabled');
    }
  }
}