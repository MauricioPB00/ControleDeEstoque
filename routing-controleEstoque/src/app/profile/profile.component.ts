import { Component, OnInit} from '@angular/core';
import { ProfileService } from '../AuthService/profile.service';
import { TemplateRef } from '@angular/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent {
  modalRef: BsModalRef;

  constructor(private profileService: ProfileService, private modalService: BsModalService,) { }
  registros: any[] = [];
  busca: string = '';
  editModal: TemplateRef<any>;

  ngOnInit(): void {
    //this.getUsuarioProfile();
    this.getAllUsuarioProfile();
   
  }
  // getUsuarioProfile(){
  //   const userId = JSON.parse(localStorage.getItem('ControleUsuario') || '{}').id
  //   this.profileService.getUsuarioProfile(userId).subscribe(
  //     (data) => {
  //       this.registros = data;
  //       console.log(this.registros);
  //     },
  //     (error) => {
  //     }
  //   );
  // }
  getAllUsuarioProfile(){
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

    console.log("Abrir modal para edição do usuário com ID:", userId);
     this.modalRef = this.modalService.show(template);
  }

  closeModal() {
    this.modalRef.hide();
  }
}
