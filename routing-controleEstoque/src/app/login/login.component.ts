import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

import { Login } from '../models/login';
import { LoginService } from '../AuthService/login.service';
import { take } from 'rxjs/operators';

import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from "ngx-spinner";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {


  constructor(
    private loginService: LoginService,
    private router: Router,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService
  ) { }

  dados: Login = { username: "", password: "" };

  ngOnInit(): void {
    this.dados.username = "";
    this.dados.password = "";
  }

  isLoginValid() {
    return (
      //this.loginData.username.includes('@') &&
      this.dados.username.length >= 8 &&
      this.dados.password.length >= 6
    );
  }

  getButtonBackgroundColor() {
    return this.isLoginValid() ? '#0f0' : '#464646';
  }
  logar() {
    console.log('aaaa');
    this.spinner.show();
    if (this.isLoginValid()) {
      this.loginService.login(this.dados.username, this.dados.password).pipe(take(1)).subscribe(
        data => {
          console.log('Resposta do servidor:', data);
          this.showAlert(data); // data //
          this.router.navigateByUrl('/home');
          this.spinner.hide();
        },
        error => {
          console.error('Erro ao fazer a chamada para o servidor:', error);
           this.showAlert(error.error);
          this.logout();
          this.spinner.hide();
        })
    }
  }

  showAlert(data:any) {
    this.toastr.success('aaaa');
    if(data != undefined){
      if (data.erro == true) {
        this.toastr.error(data.mensagem);
      } else if (data.erro == false) {
        this.toastr.success(data.mensagem);
      } else {
        this.toastr.error(JSON.stringify(data));
      }
    }
  }

  logout() {
    // remove user from local storage to log user out
    localStorage.removeItem('pgsUsuarioLogado');
    localStorage.removeItem('jwt');
  }

}
