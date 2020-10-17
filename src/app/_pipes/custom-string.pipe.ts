import { Pipe, PipeTransform } from '@angular/core';
import { HelperService } from '../_services/helper.service';
@Pipe({
  name: 'customString',
})
export class CustomStringPipe implements PipeTransform {
  carrierShort = [
    {
      origin: 'Ninja Van',
      new: 'Ninja',
    },
    {
      origin: 'J&T Express',
      new: 'J&T',
    },
    {
      origin: 'Giao Hàng Tiết Kiệm',
      new: 'GHTK',
    },
    {
      origin: 'Viettel Post',
      new: 'Viettel',
    },
    {
      origin: 'VNPost Nhanh',
      new: 'VNP Nhanh',
    },
    {
      origin: 'VNPost Tiết Kiệm',
      new: 'VNP Tiết Kiệm',
    },
  ];

  constructor(private helper: HelperService) {}
  transform(val: number | string, type: string): string {
    let statusName = '';
    switch (type) {
      case 'Sell':
        statusName =
          this.helper.arrayStatus.find((x) => x.id === +val)?.vietnamese ||
          val.toString();
        break;
      case 'ExportStatus':
        statusName =
          this.helper.exportStatus.find((x) => x.id === +val)?.name ||
          val.toString();
        break;
      case 'PaymentMethod':
        statusName =
          this.helper.paymentMethod.find((x) => x.id === +val)?.name ||
          val.toString();
        break;
      case 'ShortCarrier':
        statusName =
          this.carrierShort.find((x) => x.origin === val)?.new ||
          val.toString();
        break;
    }
    return statusName;
  }
}
