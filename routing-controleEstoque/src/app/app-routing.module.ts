import { NgModule, importProvidersFrom } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { SideBarComponent } from './side-bar/side-bar.component';
import { HomeComponent } from './home/home.component';
import { CadastroEstoqueComponent } from './cadastro-estoque/cadastro-estoque.component';
import { AuthGuard } from './guard/auth.guard';
import { authGuardMatch } from './guard/auth2.guard';
import { CadastroComponent } from './cadastro/cadastro.component';

enum Permi { admin = 1, operador = 2 }

const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'sidebar', component: SideBarComponent, canActivate: [AuthGuard], data: { roles: [Permi.operador, Permi.admin] } },
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard], data: { roles: [Permi.operador, Permi.admin] } },
  { path: 'estoque', component: CadastroEstoqueComponent, canActivate: [AuthGuard], data: { roles: [Permi.admin] } },
  { path: 'cadastro', component: CadastroComponent, canActivate: [AuthGuard], data: { roles: [Permi.admin] } },
  { path: '**', component: LoginComponent, canActivate: [AuthGuard] },

];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
