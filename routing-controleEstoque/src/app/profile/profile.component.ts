import { Component, OnInit } from '@angular/core';
import { ProfileService } from '../AuthService/profile.service';
import { TemplateRef } from '@angular/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';

export interface Usuario {
  id: number;
  name: string;
  username: string;
  email: string;
  datNasc: string;
  cpf: string;
  cidade: string;
  rg: string;
  horTrab: string;
  horaIni: string;
  horIniFim: string;
  horFimAft: string;
  horIniAft: string;
  wage: string;
  job: string;
  file: string;
}

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent {
  modalRef: BsModalRef;
  usuario: Usuario;

  constructor(private profileService: ProfileService, private modalService: BsModalService,) { }
  registros: any[] = [];
  busca: string = '';
  editModal: TemplateRef<any>;

  ngOnInit(): void {
    this.getAllUsuarioProfile();
  }

  getAllUsuarioProfile() {
    this.profileService.getAllUsuarioProfile().subscribe(
      (data) => {
        this.registros = data;
        console.log(this.registros);
      },
      (error) => {
      }
    );
  }

  openEditModal(template: TemplateRef<any>, userId: number) {
    this.disableSideBar();
      this.profileService.getUsuarioProfile(userId).subscribe(
        (data) => {
          this.usuario = data;
          console.log( this.usuario);
        },
        (error) => {
        }
      );

    this.modalRef = this.modalService.show(template);
  }
  disableSideBar() {
    const sideBar = document.querySelector('.container');
    if (sideBar) {
      sideBar.classList.add('side-bar-disabled');
    }
  }
  closeModal() {
    this.modalRef.hide();
    const sideBar = document.querySelector('.container');
    if (sideBar) {
      sideBar.classList.remove('side-bar-disabled');
    }
  }

 
}
