import { Component, OnInit, Input } from '@angular/core';
import { Sell } from 'src/app/openapi';

@Component({
  selector: 'app-print-return-orders',
  templateUrl: './print-return-orders.component.html',
  styleUrls: ['./print-return-orders.component.scss'],
})
export class PrintReturnOrdersComponent implements OnInit {
  @Input() data: Sell[];
  dateNow = new Date().getTime();
  constructor() {}

  ngOnInit(): void {}
}
