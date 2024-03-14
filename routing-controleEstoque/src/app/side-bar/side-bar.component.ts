import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Router  } from '@angular/router';

@Component({
  selector: 'app-side-bar',
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.css']
})

export class SideBarComponent implements OnInit, AfterViewInit{
  isSidebarActive: boolean = false;
  admin: boolean = false;
  showApprovalItems: boolean = false;
  
  constructor(private router: Router) {}

  ngOnInit(): void {
    const permiValue = JSON.parse(localStorage.getItem('ControleUsuarioPermi') || '{}');
    if (permiValue === '1') { 
      this.admin = true;
    }
  }

  ngAfterViewInit(): void {
    } 

  toggleSidebar(): void {
    this.isSidebarActive = !this.isSidebarActive;
  }

  toggleApprovalItems() {
    this.showApprovalItems = !this.showApprovalItems;
  }

    logout(): void {
      localStorage.clear()
      this.router.navigate(['/']);
    }

}
