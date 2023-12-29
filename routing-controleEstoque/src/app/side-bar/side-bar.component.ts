import { Component } from '@angular/core';

@Component({
  selector: 'app-side-bar',
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.css']
})
export class SideBarComponent {
  isSidebarActive: boolean = false;

  toggleSidebar(): void {
    this.isSidebarActive = !this.isSidebarActive;
  }
}