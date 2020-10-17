import { Component, OnInit, Input } from '@angular/core';
import { Sell } from 'src/app/openapi/model/sell';
import { HelperService } from 'src/app/_services/helper.service';

@Component({
  selector: 'app-order-info-paid',
  templateUrl: './order-info-paid.component.html',
  styleUrls: ['./order-info-paid.component.scss'],
})
export class OrderInfoPaidComponent implements OnInit {
  @Input() sell: Sell;
  ownPrice = 0;
  constructor(public helper: HelperService) {}

  ngOnInit(): void {
    this.sell.card_txn_fee_info = this.sell.card_txn_fee_info || {
      card_txn_fee: '0',
      rule_id: 0,
    };
    this.sell.voucher_price = this.sell.voucher_absorbed_by_seller
      ? Math.abs(Number(this.sell.voucher_price)).toString()
      : '0';
    this.sell.seller_service_fee = (
      +(this.sell.seller_service_fee || 0) +
      +this.sell.card_txn_fee_info.card_txn_fee
    ).toString();
    this.ownPrice =
      +this.sell.buyer_paid_amount -
      +this.sell.seller_service_fee -
      +this.sell.voucher_price;
  }
}
