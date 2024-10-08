import { NgModule, importProvidersFrom } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { SideBarComponent } from './side-bar/side-bar.component';
import { HomeComponent } from './home/home.component';
import { AuthGuard } from './guard/auth.guard';
import { CadastroComponent } from './cadastro/cadastro.component';
import { PontoComponent } from './ponto/ponto.component';
import { AjusteComponent } from './ajuste/ajuste.component';
import { AprovarComponent } from './aprovar/aprovar.component';
import { AprovarUpdateComponent } from './aprovar-update/aprovar-update.component';
import { ProfileComponent } from './profile/profile.component';
import { PainelComponent } from './painel/painel.component';
import { EmpresaComponent } from './empresa/empresa.component';

enum Permi { admin = 1, operador = 2 }

const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'sidebar', component: SideBarComponent, canActivate: [AuthGuard], data: { roles: [Permi.operador, Permi.admin] } },
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard], data: { roles: [Permi.operador, Permi.admin] } },
  { path: 'ponto', component: PontoComponent, canActivate: [AuthGuard], data: { roles: [Permi.operador, Permi.admin] } },
  { path: 'cadastro', component: CadastroComponent, canActivate: [AuthGuard], data: { roles: [Permi.admin] } },
  { path: 'ajuste', component: AjusteComponent, canActivate: [AuthGuard], data: { roles: [Permi.operador, Permi.admin] } },
  { path: 'aprovar/insert', component: AprovarComponent, canActivate: [AuthGuard], data: { roles: [Permi.admin] } },
  { path: 'aprovar/update', component: AprovarUpdateComponent, canActivate: [AuthGuard], data: { roles: [Permi.admin] } },
  { path: 'profile', component: ProfileComponent,canActivate: [AuthGuard],data: { roles: [Permi.operador, Permi.admin]}},
  { path: 'painel', component: PainelComponent, canActivate: [AuthGuard], data: { roles: [Permi.admin] } },
  { path: 'empresa', component: EmpresaComponent, canActivate: [AuthGuard], data: { roles: [Permi.admin] } },

  { path: '**', component: LoginComponent, canActivate: [AuthGuard] },

];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
