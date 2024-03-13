import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { FormsModule } from '@angular/forms';
import { LoginService } from './AuthService/login.service';

import { HttpClientModule } from '@angular/common/http';
import { NgxSpinnerModule } from "ngx-spinner";
import { ToastrModule } from 'ngx-toastr';
import { SideBarComponent } from './side-bar/side-bar.component';
import { HomeComponent } from './home/home.component';
import { CadastroComponent } from './cadastro/cadastro.component';
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import { PontoComponent } from './ponto/ponto.component';
import { AjusteComponent } from './ajuste/ajuste.component';
import { ModalModule } from 'ngx-bootstrap/modal';




@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    SideBarComponent,
    HomeComponent,
    CadastroComponent,
    PontoComponent,
    AjusteComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    NgxSpinnerModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot(),
    ModalModule.forRoot(),
  ],
  providers: [LoginService],
  bootstrap: [AppComponent]
})
export class AppModule { }
