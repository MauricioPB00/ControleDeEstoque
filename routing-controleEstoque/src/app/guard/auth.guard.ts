import { Injectable } from '@angular/core';
import { ActivatedRoute, ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { LoginService } from '../AuthService/login.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: LoginService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    if (this.authService.isLoggedIn()) {
      console.log(this.authService.isLoggedIn());
      const permi = JSON.parse(localStorage.getItem('ControleUsuarioPermi') || '{}');
      
      if(route.data["roles"] && route.data["roles"].includes(Number(permi))) {
        console.log('tem permi');
        return true;
      }else{
        console.log('n tem permi');
        this.router.navigate(['/home']);
        return false;
      }
    } else {
      console.log(this.authService.isLoggedIn());
      this.router.navigate(['/']);
      return false;
    }
  }
}