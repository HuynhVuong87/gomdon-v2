import { Component, OnInit } from '@angular/core';

export interface IPrint {
  id: string;
  data: any[];
}

@Component({
  selector: 'app-print',
  templateUrl: './print.component.html',
  styleUrls: ['./print.component.scss'],
})
export class PrintComponent implements OnInit {
  dataPrint: IPrint;
  constructor() {}

  ngOnInit(): void {}

  excPrint(dataPrint: IPrint) {
    this.dataPrint = dataPrint;
    console.log(dataPrint);
    const butprint: HTMLElement = document.getElementById(
      'printBut'
    ) as HTMLElement;
    setTimeout(() => {
      butprint.click();
      this.dataPrint = undefined;
    }, 1000);
  }
}
