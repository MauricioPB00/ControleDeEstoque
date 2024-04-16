import { Component, OnInit } from '@angular/core';
import { EmpresaService } from '../AuthService/empresa.service';

interface Registro {
  id: number;
  date: string;
  time: string;
  user_id: string;
  horTrab: string;
  barradeProgresso: string;
}

@Component({
  selector: 'app-empresa',
  templateUrl: './empresa.component.html',
  styleUrls: ['./empresa.component.css']
})
export class EmpresaComponent implements OnInit {
  response: Registro[] = [];

  constructor(private empresaService: EmpresaService) {
   
  }

  ngOnInit() {
    this.getHorasTrabalhadas()
    
  }
  getHorasTrabalhadas(){
    this.empresaService.getHorasTrabalhadas().subscribe(
      (data) => {
        this.response = data;
        console.log(this.response);
      },
      (error) => {
        // this.toastr.error('Erro ao buscar');
      }
    );
  }
 
}
