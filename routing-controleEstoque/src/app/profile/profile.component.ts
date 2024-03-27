import { Component, OnInit } from '@angular/core';
import { ProfileService } from '../AuthService/profile.service';
import { TemplateRef } from '@angular/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';

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

  constructor(private profileService: ProfileService, private modalService: BsModalService, private toastr: ToastrService,) { }
  successMessage: string = '';
  inputValue: string = '';
  registros: any[] = [];
  registrosBusca: any[] = [];
  userPermi: any;
  editModal: TemplateRef<any>;
  
  ngOnInit(): void {
    const Permi = JSON.parse(localStorage.getItem('ControleUsuarioPermi') || '{}');
    this.userPermi = Permi
    this.getAllUsuarioProfile();
    this.registrosBusca = this.registros;
  }

  getAllUsuarioProfile() {
    this.profileService.getAllUsuarioProfile().subscribe(
      (data) => {
        this.registros = data;
        this.registrosBusca = data;
      },
      (error) => {
      }
    );
  }

  openEditModal(template: TemplateRef<any>, userId: number) {
    if (this.userPermi == 1) {
      this.disableSideBar();
      this.profileService.getUsuarioProfile(userId).subscribe(
        (data) => {
          this.usuario = data;
        },
        (error) => {
        }
      );
      this.modalRef = this.modalService.show(template);
    }
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
  saveModal(){
    const data = this.usuario
    const userId = this.usuario.id

    this.profileService.saveUpdateUser(userId, data).subscribe(
      (response) => {
        this.toastr.success('Usuario atualizado com sucesso');
        this.closeModal();
        this.getAllUsuarioProfile();
      },
      (error) => {  
        console.error('Erro ao atualizar usuário:', error);
      }
      );
  }
  buscarPorNome() {
    if (this.inputValue.trim() !== '') {
      this.registros = this.registros.filter(user => user.name.toLowerCase().includes(this.inputValue.toLowerCase()));
    } else {
      this.getAllUsuarioProfile();
    }
  }
  limparFiltro(){
    this.inputValue = '';
    this.getAllUsuarioProfile();
  }
}
