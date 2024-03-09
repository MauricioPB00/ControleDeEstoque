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
    this.spinner.show();
    if (this.isLoginValid()) {
      this.loginService.login(this.dados.username, this.dados.password).pipe(take(1)).subscribe(
        data => {
          this.toastr.success('Logado com sucesso') 
          this.router.navigateByUrl('/home');
          this.spinner.hide();
        },
        error => {
          this.showAlert(error.error);
          this.spinner.hide();
        })
    }
  }

  showAlert(data: any) {
    if (data != undefined) {
      this.toastr.error(JSON.stringify(data));
      if (data.erro == true) {
        this.toastr.error(data.mensagem);
      } else if (data.erro == false) {
        this.toastr.success(data.mensagem);
      } else {
      }
    }
  }
}
