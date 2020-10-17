import { Component, OnInit, Input } from '@angular/core';
import { Sell } from 'src/app/openapi/model/sell';
import { DatePipe, DecimalPipe } from '@angular/common';
import { HelperService } from 'src/app/_services/helper.service';

@Component({
  selector: 'app-order-info-customer',
  templateUrl: './order-info-customer.component.html',
  styleUrls: ['./order-info-customer.component.scss'],
})
export class OrderInfoCustomerComponent implements OnInit {
  @Input() sell: Sell;
  info = [];
  constructor(
    private datePipe: DatePipe,
    private decimaPipe: DecimalPipe,
    private helper: HelperService
  ) {}

  ngOnInit(): void {
    this.info = [
      [
        {
          title: 'Mã Vận Đơn',
          value: this.sell.shipping_traceno,
          class: 'traceno',
        },
        {
          title: 'Nhà Vận Chuyển - Phí Ship',
          value: `${
            this.sell.actual_carrier
          } - Phí ship: ${this.decimaPipe.transform(
            this.sell.shipping_fee,
            '1.0-0'
          )}`,
        },
      ],
      [
        {
          title: 'Mã Đơn Hàng',
          value: this.sell.order_sn,
        },
        {
          title: 'Shop',
          value: this.sell.gomdon_shop,
        },
      ],
      [
        {
          title: 'Nickname',
          value: this.sell.buyer_user.user_name,
        },
        {
          title: 'Phương Thức Nhận Hàng',
          value: this.helper.paymentMethod.find(
            (x) => x.id === this.sell.payment_method
          ).name,
        },
      ],
      [
        {
          title: 'Tên Người Nhận',
          value: this.sell.buyer_address_name,
        },
        {
          title: 'Số Điện Thoại',
          value: `+${this.sell.buyer_address_phone}`.replace('+84', '0'),
        },
      ],
      [
        {
          title: 'Địa Chỉ Nhận Hàng',
          value: this.sell.shipping_address,
        },
      ],
    ];
  }
}
