import { Component } from '@angular/core';
import { CadastroService } from '../AuthService/cadastro.service';
import { UploadService } from '../AuthService/upload.service';

interface FormData {
  name: string;
  username: string;
  email: string;
  password: string;
  password2: string;
  cpf: string;
  rg: string;
  datNasc: string;
  cidade: string;
  horTrab: string;
  wage: string;
  job: string;
  horini1: string;
  horini2: string;
  horini3: string;
  horini4: string;
  permi: string;
}


@Component({
  selector: 'app-cadastro',
  templateUrl: './cadastro.component.html',
  styleUrls: ['./cadastro.component.css']
})
export class CadastroComponent {

  constructor(
    private cadastroService: CadastroService,
    private uploadService: UploadService
  ) { }

  imageUrl: string;
  imageUrl2: string | ArrayBuffer | null = null;
  
  onFileSelected(event: any) {
    const foto: File = event.target.files[0];
    const reader = new FileReader();

    reader.onload = () => {
      this.imageUrl2 = reader.result;
    };

    reader.readAsDataURL(foto);

    this.uploadService.uploadFile(foto).subscribe(
      response => {
        console.log('File uploaded successfully:', response);
        console.log(response.file_path);
      },
      error => {
        console.error('File upload failed:', error);
      }
    );
   }






  
  permiOptions = [
    { value: '1', label: 'Admin' },
    { value: '2', label: 'Operador' }
  ];

  formData: FormData = {
    name: '',
    username: '',
    email: '',
    password: '',
    password2: '',
    cpf: '',
    rg: '',
    datNasc: '',
    cidade: '',
    horTrab: '8:30',
    wage: '',
    job: '',
    horini1: '8:00',
    horini2: '12:00',
    horini3: '13:30',
    horini4: '18:00',
    permi: '2',
  };

  currentStep: number = 0;

  nextStep() {
    this.currentStep++;
  }

  previousStep() {
    this.currentStep--;
  }
  teste() {

  }
  finish() {
    //const formDataWithFile = { ...this.formData, imageUrl: this.imageUrl};
    const formDataWithFile = { ...this.formData};
    this.cadastroService.cadastrar(formDataWithFile).pipe().subscribe(
      data => {
        console.log('Resposta do servidor:', data);
        this.resetForm();
      },
      error => {
        console.error('Erro ao fazer a chamada para o servidor:', error);
      })

  }

  resetForm() {
    this.currentStep = 0;
    this.formData = {
      name: '',
      username: '',
      email: '',
      password: '',
      password2: '',
      cpf: '',
      rg: '',
      datNasc: '',
      cidade: '',
      horTrab: '8:30',
      wage: '',
      job: '',
      horini1: '8:00',
      horini2: '12:00',
      horini3: '13:30',
      horini4: '18:00',
      permi: '2',
    };
  }
}
