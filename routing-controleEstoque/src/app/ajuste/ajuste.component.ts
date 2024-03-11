import { Component, OnInit } from '@angular/core';
import { AjusteService } from '../AuthService/ajuste.service';
import { ToastrService } from 'ngx-toastr';

interface Registro {
  id: number;
  date: string;
  time: string;
}

@Component({
  selector: 'app-ajuste',
  templateUrl: './ajuste.component.html',
  styleUrls: ['./ajuste.component.css']
})
export class AjusteComponent {

  constructor(private ajusteService: AjusteService, private toastr: ToastrService,) { }

  response: Registro[] = [];

  ngOnInit(): void {
    this.getRegistrosAjuste();
  }

  getRegistrosAjuste() {
    var userId = JSON.parse(localStorage.getItem('ControleUsuario') || '{}');
    userId = userId.id;

    if (userId) {
      this.ajusteService.getRegistrosAjuste(userId).subscribe(
        (data) => {
          console.log('Dados recebidos:', data);
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
}
