import { Component, Input, OnChanges } from '@angular/core';
import * as JsBarcode from 'jsbarcode';
import { Sell } from 'src/app/openapi';
@Component({
  selector: 'app-print-orders-barcode',
  templateUrl: './print-orders-barcode.component.html',
  styleUrls: ['./print-orders-barcode.component.scss'],
})
export class PrintOrdersBarcodeComponent implements OnChanges {
  @Input() data: Sell[];
  widthRef = [
    {
      name: 'VNPost Nhanh',
      width: 1.2,
      marginLeft: 6,
    },
    {
      name: 'Ninja Van',
      width: 0.8,
      fontsize: 14,
      marginLeft: 14,
    },
    {
      name: 'Viettel Post',
      width: 0.9,
      marginLeft: 10,
    },
    {
      name: 'J&T Express',
      width: 1.6,
      marginLeft: 15,
    },
    {
      name: 'Giao Hàng Tiết Kiệm',
      width: 1.6,
      marginLeft: 13,
    },
  ];
  constructor() {}

  ngOnChanges(): void {
    window.setTimeout(() => {
      for (const i in this.data) {
        const { shipping_traceno, actual_carrier } = this.data[i];
        JsBarcode(`#barcode-${i}`, shipping_traceno, {
          format: 'code128',
          margin: 0,
          marginLeft:
            this.widthRef.find((x) => x.name === actual_carrier)?.marginLeft ||
            15,
          width:
            this.widthRef.find((x) => x.name === actual_carrier)?.width || 1.1,
          height: 55,
          fontSize:
            this.widthRef.find((x) => x.name === actual_carrier)?.fontsize ||
            16,
        });
      }
    }, 100);
  }
}
