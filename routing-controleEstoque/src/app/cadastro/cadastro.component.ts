import { Component } from '@angular/core';
import { CadastroService } from '../AuthService/cadastro.service';
import { UploadService } from '../AuthService/upload.service';
import { firstValueFrom } from 'rxjs';
import { ToastrService } from 'ngx-toastr';


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
    private uploadService: UploadService,
    private toastr: ToastrService,
  ) { }

  imageUrl: string;
  imageUrl2: string | ArrayBuffer | null = null;
  fotoa: File;

  onFileSelected(event: any) {
    const foto: File = event.target.files[0];

    const reader = new FileReader();

    reader.onload = () => {
      this.imageUrl2 = reader.result;
    };

    reader.readAsDataURL(foto);

    this.fotoa = foto
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
  async finish() {
    try {
      const foto = await firstValueFrom(this.uploadService.uploadFile(this.fotoa))

      const formDataWithFile = { ...this.formData, foto: foto.file_path };

      await firstValueFrom(this.cadastroService.cadastrar(formDataWithFile))
      this.resetForm();
      this.toastr.success('Sucesso ao cadastrar');
    }
    catch(erro){
      this.toastr.error('Erro ao Cadastrar');
    }
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
      permi: '2',
    };
  }
}
