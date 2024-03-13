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
  horasDoDiaSelecionado: Registro[] = [];
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
    console.log('registrosPorDia',this.registrosPorDia);
  }

  openModal(template: TemplateRef<any>, index: number) {
    this.disableSideBar();
    const group = this.registrosPorDia[index];
    console.log('group',group)
    const registrosdata = group.registros.map(registro => registro.date);
    const registros = group.registros.map(registro => registro.time);

    this.modalRef = this.modalService.show(template);
    console.log('registros', registros);
    this.horasDoDiaSelecionado = Array.from({length:4},(_,i)=> {
      return group.registros[i] || {
        id:-1,date: registrosdata[0], time: '',
      }
    } );
    console.log('horasDoDiaSelecionado',this.horasDoDiaSelecionado);
  }
  
  salvarHoras() {
    console.log(this.horasDoDiaSelecionado);
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