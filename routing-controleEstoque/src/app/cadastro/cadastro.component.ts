import { Component } from '@angular/core';

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
  teste: string;
}

@Component({
  selector: 'app-cadastro',
  templateUrl: './cadastro.component.html',
  styleUrls: ['./cadastro.component.css']
})
export class CadastroComponent {


  imageUrl: string | ArrayBuffer | null = null;

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    const reader = new FileReader();

    reader.onload = () => {
      this.imageUrl = reader.result;
    };

    reader.readAsDataURL(file);
  }

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
    horTrab: '',
    wage: '',
    job: '',
    horini1: '',
    horini2: '',
    horini3: '',
    horini4: '',
    teste: ''
  };

  currentStep: number = 0;

  nextStep() {
    this.currentStep++;
  }

  previousStep() {
    this.currentStep--;
  }
  teste(){

  }
  finish() {
    console.log('Form Data:', this.formData);
    console.log('Arquivo selecionado:', this.imageUrl);
    const formDataWithFile = { ...this.formData, imageUrl: this.imageUrl };
    console.log('Form Dataaaaaaaaa:', formDataWithFile);
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
      horTrab: '',
      wage: '',
      job: '',
      horini1: '',
      horini2: '',
      horini3: '',
      horini4: '',
      teste: ''

    };
  }
}
