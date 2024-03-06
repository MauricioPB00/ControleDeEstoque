import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CadastroService } from '../AuthService/cadastro.service';

import { Register } from '../models/register';

@Component({
  selector: 'app-cadastro',
  templateUrl: './cadastro.component.html',
  styleUrls: ['./cadastro.component.css']
})
export class CadastroComponent {


  constructor(
    private http: HttpClient,
    private cadastroService: CadastroService
  ) { }
  cadastro: any;
  dados: Register = { username: "", password: "", email: "", permi: "" };

  ngOnInit(): void {
    this.dados.username = "";
    this.dados.password = "";
    this.dados.email = "";
    this.dados.permi = "";
  }
  cadastrar() {
    console.log('datacadastar', this.dados.username, this.dados.password, this.dados.email, this.dados.permi);
    return this.cadastroService.cadastrar(this.dados.username, this.dados.password, this.dados.email, this.dados.permi).subscribe((data: {}) => {
      this.cadastro = data;
      console.log(this.cadastro);
    });
  }

}
