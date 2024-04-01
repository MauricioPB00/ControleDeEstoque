import { Component, OnInit } from '@angular/core';
import { AjusteService } from '../AuthService/ajuste.service';
import { ToastrService } from 'ngx-toastr';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { TemplateRef } from '@angular/core';
import { PontoService } from '../AuthService/ponto.service';

interface Registro {
  id: number;
  date: string;
  time: string;
  hor_trab: string;
}

interface RegistroGroup {
  date: string;
  registros: Registro[];
  totalHorasTrabalhadas?: string;
  mostrarAviso?: boolean;
  classeAviso?: string;
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
    private modalService: BsModalService,
    private pontoService: PontoService) { }

  registrosPorDia: RegistroGroup[] = [];
  horasDoDiaSelecionado: Registro[] = [];
  diaSelecionado: string[] = [];
  editModal: TemplateRef<any>;
  successMessage: string = '';

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
    this.calculaHora();
  }

  calculaHora() {
    this.registrosPorDia.forEach(dia => {
      let horasTrabalhadas = 0;
  
      if (dia.registros.length % 2 !== 0) {
        console.log('Número ímpar de registros para o dia:', dia);
        return;
      }
  
      const registros = dia.registros.map(registro => new Date('1970-01-01T' + registro.time));
  
      for (let i = 0; i < registros.length; i += 2) {
        const horaEntrada = registros[i];
        const horaSaida = registros[i + 1];
        const diferencaMillisegundos = horaSaida.getTime() - horaEntrada.getTime();
        const horas = Math.floor(diferencaMillisegundos / (1000 * 60 * 60));
        const minutos = Math.floor((diferencaMillisegundos % (1000 * 60 * 60)) / (1000 * 60));
        horasTrabalhadas += horas + minutos / 60;
      }
  
      dia.totalHorasTrabalhadas = `${Math.floor(horasTrabalhadas)}:${Math.round(horasTrabalhadas % 1 * 60)}`;
  
      if (dia.totalHorasTrabalhadas === dia.registros[0]?.hor_trab) {
        dia.mostrarAviso = false; 
      } else if  (dia.totalHorasTrabalhadas > dia.registros[0]?.hor_trab) {
        dia.mostrarAviso = true; 
      }else if  (dia.totalHorasTrabalhadas < dia.registros[0]?.hor_trab) {
        dia.mostrarAviso = true; 
        dia.classeAviso = 'yellow';
      }
    });
  }

  openModal(template: TemplateRef<any>, index: number) {
    this.disableSideBar();
    const group = this.registrosPorDia[index];
    const registrosdata = group.registros.map(registro => registro.date);

    const horasDoDiaLength = Math.max(group.registros.length, 4);

    this.horasDoDiaSelecionado = Array.from({ length: horasDoDiaLength }, (_, i) => {
      return group.registros[i] || { id: -1, date: registrosdata[0], time: '' };
    });

    this.modalRef = this.modalService.show(template);
    this.diaSelecionado = registrosdata;
  }

  ajusteData(registros:Registro[]){
    const registrosFormat = registros.map(registro => registro.time).join(' | ')
    return registrosFormat;
  }

  salvarHoras() {
    const elementosVazioInsert = this.horasDoDiaSelecionado.filter(item => item.time.trim() !== '' && item.id < 0);
    const elementoEditadoUpdate = this.horasDoDiaSelecionado.filter(item => item.time.trim() !== '' && item.id > 0);
    let userId = JSON.parse(localStorage.getItem('ControleUsuario') || '{}');
    userId = userId.id;

    if (elementosVazioInsert.length > 0) {
      try {
        for (let i = 0; i < elementosVazioInsert.length; i++) {
          const element = elementosVazioInsert[i];
          const { date, time } = element;
          this.ajusteService.postRegistrar(userId, date, time)
            .subscribe(
              (data) => {
                this.toastr.success('Hora Editada');
              },
              (error) => {
                this.toastr.error('Erro ao Editar');
              }
            );
        }
      } catch (erro) {
        this.toastr.error('Erro ao Editar');
      }
    }
    if (elementoEditadoUpdate.length > 0) {
      try {
        for (let i = 0; i < elementoEditadoUpdate.length; i++) {
          const element = elementoEditadoUpdate[i];
          const { date, time, id } = element;
          this.ajusteService.postRegistrarUpdate(userId, date, time, id)
            .subscribe(
              (data) => {
                this.toastr.success('Hora Editada');
                const dateTime = data.dateTime;
                this.successMessage = `Hora Ajustada com sucesso!`;
              },
              (error) => {
                this.toastr.error('Erro ao Editar');
              }
            );
        }
      } catch (erro) {
        this.toastr.error('Erro ao Editar');
      }
    }
    this.getRegistrosAjuste();
    this.closeModal();
  }

  disableSideBar() {
    const sideBar = document.querySelector('.container');
    if (sideBar) {
      sideBar.classList.add('side-bar-disabled');
    }
  }

  closeModal() {
    this.modalRef.hide();
    this.getRegistrosAjuste();
    const sideBar = document.querySelector('.container');
    if (sideBar) {
      sideBar.classList.remove('side-bar-disabled');
    }
  }
}