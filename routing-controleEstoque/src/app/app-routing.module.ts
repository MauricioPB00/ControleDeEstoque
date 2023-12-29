import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { SideBarComponent } from './side-bar/side-bar.component';
import { HomeComponent } from './home/home.component';



  const routes: Routes = [
    { path: '', component: LoginComponent }, 
    { path: 'sidebar', component: SideBarComponent},
    { path: 'home', component: HomeComponent},

  ];
 

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
