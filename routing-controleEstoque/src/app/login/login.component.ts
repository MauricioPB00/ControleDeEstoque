import { Component } from '@angular/core';
import { LoginService } from '../AuthService/login.service';
import { Router } from '@angular/router';
import { Login } from '../models/login';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  public loginData: Login = {
    username: '',
    password: ''
  };

  constructor(
    private loginService: LoginService,
    private router: Router,
  ) { }

  isLoginValid() {
    return (
      //this.loginData.username.includes('@') &&
      //this.loginData.username.length >= 10 &&
      this.loginData.password.length >= 6
    );
  }

  getButtonBackgroundColor() {
    return this.isLoginValid() ?  '#0f0' : '#464646' ;
  }

  onSubmit(): void {
    if (this.isLoginValid()) {
      console.log('Login Data:', this.loginData);

      this.loginService.login(this.loginData.username, this.loginData.password).subscribe(
        (response) => {
          console.log('Resposta do servidor:', response);
          this.router.navigate(['/home']);
        },
        (error) => {
          console.error('Erro ao fazer a chamada para o servidor:', error);
        }
      );
    }
  }
}