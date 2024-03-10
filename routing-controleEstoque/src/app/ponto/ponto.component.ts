import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-ponto',
  templateUrl: './ponto.component.html',
  styleUrls: ['./ponto.component.css']
})
export class PontoComponent implements OnInit {
  currentDateTime: Date;

  constructor() { }

  ngOnInit(): void {
    this.updateDateTime();
    setInterval(() => {
      this.updateDateTime();
    }, 1000);
  }

  updateDateTime() {
    this.currentDateTime = new Date();
  }
  registrar(){
    console.log('a');
  }
}