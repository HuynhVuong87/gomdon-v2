import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-print-export',
  templateUrl: './print-export.component.html',
  styleUrls: ['./print-export.component.scss'],
})
export class PrintExportComponent implements OnInit {
  @Input() data: any[];
  date = new Date().getTime();
  constructor() {}

  ngOnInit(): void {}
}
