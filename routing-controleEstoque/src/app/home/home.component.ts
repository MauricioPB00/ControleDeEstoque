import { Component, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements AfterViewInit {

  ngAfterViewInit() {
    const botaoBusca = document.getElementById('botao-busca') as HTMLElement;
    const campoBusca = document.getElementById('campo-busca') as HTMLInputElement;

    botaoBusca.addEventListener('click', () => {
      this.realizarBusca(campoBusca.value);
    });

    campoBusca.addEventListener('keypress', (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        this.realizarBusca(campoBusca.value);
      }
    });
  }

  realizarBusca(termoBusca: string) {
    console.log('Buscando por: ' + termoBusca);
    // Lógica para processar a busca com 'termoBusca' aqui
  }
}
