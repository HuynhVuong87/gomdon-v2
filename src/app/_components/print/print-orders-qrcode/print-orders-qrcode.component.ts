import {
  Component,
  OnInit,
  Input,
  AfterViewChecked,
  AfterViewInit,
} from '@angular/core';
import { Sell } from 'src/app/openapi';
declare var QRCode;
@Component({
  selector: 'app-print-orders-qrcode',
  templateUrl: './print-orders-qrcode.component.html',
  styleUrls: ['./print-orders-qrcode.component.scss'],
})
export class PrintOrdersQrcodeComponent implements AfterViewInit {
  @Input() data: Sell[];
  constructor() {}

  ngAfterViewInit(): void {
    this.data.forEach((o) => {
      // tslint:disable-next-line: no-unused-expression
      new QRCode(document.getElementById(o.order_sn), {
        text: o.shipping_traceno,
        correctLevel: QRCode.CorrectLevel.M,
        width: 76,
        height: 76,
      });
    });
  }
}
