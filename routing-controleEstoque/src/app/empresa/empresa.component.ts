import { Component, OnInit } from '@angular/core';

import { FeriadoService } from '../AuthService/feriado.service';

@Component({
  selector: 'app-empresa',
  templateUrl: './empresa.component.html',
  styleUrls: ['./empresa.component.css']
})
export class EmpresaComponent implements OnInit {


  constructor(private feriadoService: FeriadoService) {
   
  }

  ngOnInit() {
    
  }
 
}
