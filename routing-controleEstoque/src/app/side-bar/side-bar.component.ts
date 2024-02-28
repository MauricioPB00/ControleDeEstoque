import { Component } from '@angular/core';
import { Router  } from '@angular/router';

@Component({
  selector: 'app-side-bar',
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.css']
})

export class SideBarComponent {
  isSidebarActive: boolean = false;
  
  constructor(private router: Router) {}

  toggleSidebar(): void {
    this.isSidebarActive = !this.isSidebarActive;
  }


    logout(): void {
      // remove user from local storage to log user out
      localStorage.removeItem('pgsUsuarioLogado');
      localStorage.removeItem('jwt');
      localStorage.removeItem('ControleUsuarioIP');
      localStorage.removeItem('ControleUsuarioPermi');
      this.router.navigate(['/']);
    }

}
