import { Component, OnInit } from '@angular/core';
import { PontoService } from '../AuthService/ponto.service';
import { ToastrService } from 'ngx-toastr';

interface Registro {
  id: number;
  date: string;
  time: string;
}

@Component({
  selector: 'app-ponto',
  templateUrl: './ponto.component.html',
  styleUrls: ['./ponto.component.css']
})
export class PontoComponent implements OnInit {
  currentDateTime: Date;
  response: Registro[] = [];
  successMessage: string = '';


  constructor(private pontoService: PontoService, private toastr: ToastrService,) { }


  ngOnInit(): void {
    this.relogio();
    this.getRegistros();
  }
  relogio() {
    this.updateDateTime();
    setInterval(() => {
      this.updateDateTime();
    }, 1000);

  }
  updateDateTime() {
    this.currentDateTime = new Date();
  }

  registrar() {
    var userId = JSON.parse(localStorage.getItem('ControleUsuario') || '{}');
    userId = userId.id;

    var currentDate = new Date();
    var date = this.formatDate(currentDate);
    var time = this.formatTime(currentDate);

    try {
      this.pontoService.postRegistrar(userId, date, time)
        .subscribe(
          (data) => {
            this.toastr.success('Hora apontada');
            this.getRegistros();
            if (Array.isArray(data)) {
              // Se data for um array de objetos, você pode decidir o que fazer com eles aqui.
            } else if (typeof data === 'object' && data.hasOwnProperty('dateTime')) {
              // Se data for um objeto com uma propriedade dateTime, você pode exibi-la aqui.
              const dateTime = data.dateTime;
              this.successMessage = `Hora registrada com sucesso! Data e hora: ${dateTime}`;
            } else {
              // Se data não estiver no formato esperado, trate o erro aqui.
              this.toastr.error('Erro ao Apontar');
            }
          },
        );
    } catch (erro) {
      this.toastr.error('Erro ao Apontar');
    }
  }

  getRegistros() {
    var userId = JSON.parse(localStorage.getItem('ControleUsuario') || '{}');
    userId = userId.id

    if (userId) {
      this.pontoService.getRegistros(userId).subscribe(
        (data) => {
          this.response = data;
        },
        (error) => {
          this.toastr.error('Erro ao buscar');
        }
      );
    } else {
      this.toastr.error('Erro ao encontrar o ID');
    }
  }

  formatDate(date: Date): string {
    return `${date.getFullYear()}-${this.padZero(date.getMonth() + 1)}-${this.padZero(date.getDate())}`;
  }

  formatTime(date: Date): string {
    return `${this.padZero(date.getHours())}:${this.padZero(date.getMinutes())}:${this.padZero(date.getSeconds())}`;
  }

  padZero(num: number): string {
    return num < 10 ? '0' + num : num.toString();
  }
}