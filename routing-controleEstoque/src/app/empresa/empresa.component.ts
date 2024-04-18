import { Component, OnInit } from '@angular/core';
import { EmpresaService } from '../AuthService/empresa.service';

interface Registro {
  user: number;
  mes: string;
  ano: string;
  diasFaltados: string;
  diasTrabalhados: string;
  diasUteis: string;
  horasFaltando: string;
  horasNoMesTrabalhadas: string;
  totalHorasDiasSemana: string;
  totalHorasDomingo: string;
  totalHorasSabado: string;
  progressBar: string;
}

@Component({
  selector: 'app-empresa',
  templateUrl: './empresa.component.html',
  styleUrls: ['./empresa.component.css']
})
export class EmpresaComponent implements OnInit {
  response: Registro[] = [];

  constructor(private empresaService: EmpresaService) {}

  ngOnInit() {
    this.getHorasTrabalhadas();
  }
  
  getHorasTrabalhadas() {
    this.empresaService.getHorasTrabalhadas().subscribe(
      (data: Registro[]) => {
        this.response = this.formatarHoras(data);
        console.log('Dados recebidos:', this.response);
      },
      (error) => {
        console.error('Erro ao buscar horas trabalhadas:', error);
      }
    );
  }

  formatarHoras(data: Registro[]): Registro[] {
    return data.map(registro => ({
      ...registro,
      horasNoMesTrabalhadas: this.formatarNumero(registro.horasNoMesTrabalhadas),
      totalHorasDiasSemana: this.formatarNumero(registro.totalHorasDiasSemana),
      totalHorasDomingo: this.formatarNumero(registro.totalHorasDomingo),
      totalHorasSabado: this.formatarNumero(registro.totalHorasSabado),
    }));
  }

  formatarNumero(numero: string): string {
    return parseFloat(numero).toFixed(2);
  }
  parsePercentageToInt(percentage: string): number {
    console.log(percentage.replace('%', ''), 10)
    return parseInt(percentage.replace('%', ''), 10);
  }
}
