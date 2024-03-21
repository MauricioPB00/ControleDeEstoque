import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Router  } from '@angular/router';
import { SidebarService } from '../AuthService/sidebar.service';

@Component({
  selector: 'app-side-bar',
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.css']
})

export class SideBarComponent implements OnInit, AfterViewInit{
  isSidebarActive: boolean = false;
  admin: boolean = false;
  showApprovalItems: boolean = false;
  data: any;
  
  constructor(private router: Router, private sidebarService: SidebarService) {}

  ngOnInit(): void {
    const permiValue = JSON.parse(localStorage.getItem('ControleUsuarioPermi') || '{}');
    if (permiValue === '1') { 
      this.admin = true;
    }
    var userId = JSON.parse(localStorage.getItem('ControleUsuario') || '{}');
    userId = userId.id;
    this.sidebarService.getBuscarFoto(userId).subscribe(
      (data) => {
        this.data = data.file;
      },
      (error) => {
      }
    );
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
