import { NgModule, importProvidersFrom } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { SideBarComponent } from './side-bar/side-bar.component';
import { HomeComponent } from './home/home.component';
import { CadastroEstoqueComponent } from './cadastro-estoque/cadastro-estoque.component';



  const routes: Routes = [
    { path: '', component: LoginComponent }, 
    { path: 'sidebar', component: SideBarComponent},
    { path: 'home', component: HomeComponent},
    { path: 'estoque', component: CadastroEstoqueComponent},

  ];
 

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
