import { NgModule, importProvidersFrom } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { SideBarComponent } from './side-bar/side-bar.component';
import { HomeComponent } from './home/home.component';
import { CadastroEstoqueComponent } from './cadastro-estoque/cadastro-estoque.component';
import { AuthGuard } from './guard/auth.guard';
import { authGuardMatch } from './guard/auth2.guard';



  const routes: Routes = [
    { path: '', component: LoginComponent }, 
    { path: 'sidebar', component: SideBarComponent,canActivate: [AuthGuard]},
    { path: 'home', component: HomeComponent,canActivate: [AuthGuard]},
    { path: 'estoque', component: CadastroEstoqueComponent, canActivate: [authGuardMatch]},
    { path: '**', component: HomeComponent,canActivate: [AuthGuard]},

  ];
 

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
