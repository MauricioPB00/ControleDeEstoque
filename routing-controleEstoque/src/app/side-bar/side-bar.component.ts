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
      localStorage.clear()
      this.router.navigate(['/']);
    }

}
