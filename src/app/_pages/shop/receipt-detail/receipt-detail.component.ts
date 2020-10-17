import {
  Component,
  OnInit,
  ViewChild,
  TemplateRef,
  OnDestroy,
} from '@angular/core';
import { HelperService } from 'src/app/_services/helper.service';
import { FirestoreService } from 'src/app/_services/firestore.service';
import { ReceiptService, SellService, Sell } from 'src/app/openapi';
import { ActivatedRoute } from '@angular/router';
import { ExcelService } from 'src/app/_services/excel.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-receipt-detail',
  templateUrl: './receipt-detail.component.html',
  styleUrls: ['./receipt-detail.component.scss'],
})
export class ReceiptDetailComponent implements OnInit, OnDestroy {
  id: string;
  @ViewChild('moneyView', { static: true }) moneyView: TemplateRef<any>;
  @ViewChild('dateView', { static: true }) dateView: TemplateRef<any>;
  @ViewChild('linkRef', { static: true }) linkRef: TemplateRef<any>;
  @ViewChild('status', { static: true }) statusView: TemplateRef<any>;
  @ViewChild('payMethod', { static: true }) payMethod: TemplateRef<any>;

  data: any;
  rows: Sell[] = [];
  temp = [];
  cols = [];
  search = '';
  sub: Subscription;
  selected: any[] = [];
  constructor(
    private helper: HelperService,
    private fsSV: FirestoreService,
    private receiptSV: ReceiptService,
    private route: ActivatedRoute,
    private sellSV: SellService,
    private xlsxSV: ExcelService
  ) {
    this.id = route.snapshot.params.id;
  }

  ngOnInit() {
    this.cols = [
      {
        prop: 'selected',
        name: '',
        sortable: true,
        canAutoResize: false,
        draggable: false,
        resizable: false,
        headerCheckboxable: true,
        checkboxable: true,
        width: 38,
      },
      // {
      //   name: 'ID',
      //   prop: 'order_id'
      // },
      {
        name: 'ID ĐƠN',
        prop: 'order_sn',
        linkRef: 'https://banhang.shopee.vn/portal/sale/',
        key: 'order_id',
        cellTemplate: this.linkRef,
      },
      {
        name: 'MÃ VẬN ĐƠN',
        prop: 'shipping_traceno',
        cellClass: 'align-left',
        linkRef: '/order/',
        key: 'order_sn',
        cellTemplate: this.linkRef,
      },
      // {
      //   name: 'NGÀY TẠO',
      //   prop: 'gomdon_ctime',
      //   cellClass: 'align-left',
      // },
      {
        name: 'CHUYỂN ĐẾN',
        prop: 'move_in',
        cellClass: 'align-left',
      },
      // {
      //   name: 'MÔ TẢ',
      //   prop: 'actual_carrier',
      //   cellClass: 'align-left'
      // },

      {
        name: 'SHOP GIẢM GIÁ (₫)',
        prop: 'voucher_price',
        width: 80,
        cellTemplate: this.moneyView,
        cellClass: 'align-right',
      },
      {
        name: 'TIỀN HÀNG (₫)',
        prop: 'buyer_paid_amount',
        cellTemplate: this.moneyView,
        cellClass: 'align-right',
      },
      {
        name: 'PHÍ SHIP (₫)',
        prop: 'shipping_fee',
        width: 90,
        cellTemplate: this.moneyView,
        cellClass: 'align-right',
      },
      {
        name: 'PHÍ GIAO DỊCH (A)',
        prop: 'card_txn_fee_info.card_txn_fee',
        width: 80,
        cellTemplate: this.moneyView,
        cellClass: 'align-right',
      },
      {
        name: '%A',
        prop: 'percentTxn',
        width: 80,
      },
      {
        name: 'PHÍ DỊCH VỤ (B)',
        prop: 'seller_service_fee',
        width: 80,
        cellTemplate: this.moneyView,
        cellClass: 'align-right',
      },
      {
        name: '%B',
        prop: 'percentService',
        width: 80,
      },
      {
        name: 'shopee trợ giá',
        prop: 'rebate',
        width: 80,
        cellTemplate: this.moneyView,
        cellClass: 'align-right',
      },
      {
        name: 'CÔNG NỢ (₫)',
        prop: 'moneyEXP',
        cellTemplate: this.moneyView,
        cellClass: 'align-right',
      },
      {
        name: 'SÀN TRẢ (₫)',
        prop: 'paid',
        cellTemplate: this.moneyView,
        cellClass: 'align-right',
      },
      {
        name: 'ĐỐI SOÁT',
        prop: 'offset',
        cellTemplate: this.moneyView,
        cellClass: 'align-right',
      },
      {
        name: 'NGÀY TRẢ',
        prop: 'date',
      },
      {
        name: 'PTTT',
        prop: 'payment_method',
        width: 80,
        cellTemplate: this.payMethod,
      },
    ];

    this.receiptSV.getById(this.id).subscribe((res: any) => {
      if (res.code === 'success') {
        this.data = res.data;
        this.sellSV
          .getByIdsSell(res.data.orders.map((x) => x.order_sn))
          .subscribe((res1: any) => {
            const data = [];
            res1.forEach((x) => {
              x = x.data;
              let rebate = 0;
              x.order_items.forEach((item: any) => {
                rebate += +item.item_model.rebate_price || 0;
              });
              x.rebate = rebate;
              x.voucher_price = x.voucher_absorbed_by_seller
                ? x.voucher_price
                : '0';
              x.seller_service_fee = (+(x.seller_service_fee || 0)).toString();
              x.moneyEXP =
                Number(x.buyer_paid_amount) -
                Number(x.card_txn_fee_info.card_txn_fee) -
                Number(x.seller_service_fee || 0) -
                Number(x.voucher_price) +
                rebate;
              x.paid = res.data.orders.find(
                (y) => y.order_sn === x.order_sn
              ).paid;
              x.percentService =
                (
                  (Number(x.seller_service_fee) /
                    (Number(x.buyer_paid_amount) - Number(x.voucher_price))) *
                  100
                ).toFixed(2) + ' %';
              x.percentTxn =
                (
                  (Number(x.card_txn_fee_info.card_txn_fee) /
                    (Number(x.buyer_paid_amount) +
                      Number(x.shipping_fee) -
                      Number(x.coin_offset || 0) -
                      Number(x.voucher_price))) *
                  100
                ).toFixed(2) + ' %';

              x.offset = x.paid - x.moneyEXP;

              const { move_in, date_receive } = x.transaction_logs.find(
                (y) => y.receiptId === this.id
              );
              x.move_in = move_in;
              x.date = date_receive;
              console.log(x);
              data.push(x);
            });
            this.rows = [...data];
            this.temp = this.rows;
          });
      }
    });
    this.sub = this.helper.action_btns.subscribe((btns) => {
      if (btns.func !== '' && typeof this[btns.func] === 'function') {
        // this.current_func = btns.func;
        this[btns.func]();
      }
    });
  }
  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  searchOrder(e): void {
    this.rows = this.helper.searchOrder(this.temp, e);
  }
  exportExcel() {
    const datas = this.selected;
    const data = this.helper.convertKeyToColName(datas, this.cols);
    this.xlsxSV.exportAsExcelFile(data, 'Đơn hoàn ');
  }
  onSelect({ selected }): void {
    this.selected.splice(0, this.selected.length);
    this.selected.push(...selected);
    if (this.selected.length > 0) {
      this.helper.setBtns([
        {
          func: 'exportExcel',
          icon: 'download',
          title: 'Xuất Ra Excel',
        },
      ]);
    } else {
      this.helper.setBtns([]);
    }
  }
}
