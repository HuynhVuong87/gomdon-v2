import {
  Component,
  OnInit,
  ViewChild,
  TemplateRef,
  OnDestroy,
} from '@angular/core';
import { NzUploadChangeParam, NzNotificationService } from 'ng-zorro-antd';
import { ExcelService } from 'src/app/_services/excel.service';
import { HelperService } from 'src/app/_services/helper.service';
import { Subscription } from 'rxjs';
import { SellService, SellCreateReceipt } from 'src/app/openapi';
import { AuthService } from 'src/app/_services/auth.service';

@Component({
  selector: 'app-check-payment',
  templateUrl: './check-payment.component.html',
  styleUrls: ['./check-payment.component.scss'],
})
export class CheckPaymentComponent implements OnInit, OnDestroy {
  file: File;
  types = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'application/vnd.ms-excel.sheet.macroEnabled.12',
  ];
  headers = 'Ngày, Chuyển đến, Thanh Toán, Mô tả, Trạng thái, Số dư';
  @ViewChild('moneyView', { static: true }) moneyView: TemplateRef<any>;
  @ViewChild('dateView', { static: true }) dateView: TemplateRef<any>;
  @ViewChild('linkRef', { static: true }) linkRef: TemplateRef<any>;
  @ViewChild('sellerService', { static: true }) sellerService: TemplateRef<any>;
  @ViewChild('payMethod', { static: true }) payMethod: TemplateRef<any>;
  date: Date;
  paid: number;
  moneyExp: number;
  bank = '';
  rows: any[];
  temp = [];
  data: any;
  columns = [];
  sub: Subscription;
  selected: any[] = [];
  note = '';
  carrierList = [];
  dis = false;
  constructor(
    private helper: HelperService,
    private xlsxSV: ExcelService,
    private notification: NzNotificationService,
    private sellSV: SellService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.columns = [
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
  reload() {
    location.reload();
  }

  detectCarrier(): void {
    const status = [];
    for (const item of this.rows) {
      status.push(item.actual_carrier);
    }
    this.carrierList = [...new Set(status)];
  }

  searchOrder(e): void {
    this.rows = this.helper.searchOrder(this.temp, e);
  }
  exportExcel() {
    const datas = this.selected;
    const data = this.helper.convertKeyToColName(datas, this.columns);
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

  async handleChange({ file }: NzUploadChangeParam): Promise<void> {
    console.log(
      file.originFileObj.type,
      this.types.includes(file.originFileObj.type)
    );
    if (this.types.includes(file.originFileObj.type)) {
      this.file = file.originFileObj;

      const headerName = this.headers
        .split(',')
        .map((x) => x.trim().toString());
      this.data =
        (await this.xlsxSV.readFilePayment(this.file, headerName)) || [];

      // this.data.length = 10;
      if (this.data.length > 0) {
        const indexRuttien = this.data
          .filter((x) =>
            x['Mô tả'].toString().toLowerCase().includes('rút tiền')
          )
          .map((x) => x.index);
        if (this.data[indexRuttien[1]]) {
          this.date = new Date(this.data[indexRuttien[1]].Ngày);
          this.data = this.data.slice(indexRuttien[0] + 1, indexRuttien[1]).map(
            // cộng thêm 1 để bỏ qua dòng rút tiền
            ({
              Ngày: date,
              'Thanh Toán': paid,
              // tslint:disable-next-line: variable-name
              'Chuyển đến': move_in,
              'Mô tả': id,
              'Số dư': balance,
            }) => ({
              date,
              paid: Number(paid),
              move_in,
              id: /\b(\w+)$/.exec(id)[1],
              balance: Number(balance),
              desc: id,
            })
          );
          console.log(this.data);
          this.sellSV.paymentCheckSell(this.data).subscribe((res: any) => {
            this.data = this.data.map((x) => {
              const obj = res.find((y) => y.id === x.id).data;
              if (obj.sell) {
                x = Object.assign(x, obj.sell.mess);
                x.gomdon_ctime = this.helper.milisecToDate(
                  x.gomdon_ctime * 1000,
                  'dd/MM/y'
                );
                x.voucher_price = x.voucher_absorbed_by_seller
                  ? x.voucher_price
                  : '0';
                let rebate = 0;
                x.order_items.forEach((item: any) => {
                  rebate += +item.item_model.rebate_price || 0;
                });
                x.rebate = rebate;
                x.seller_service_fee = (+(
                  x.seller_service_fee || 0
                )).toString();
                x.moneyEXP =
                  x.rebate +
                  Number(x.buyer_paid_amount) -
                  Number(x.seller_service_fee) -
                  +x.card_txn_fee_info.card_txn_fee -
                  Number(x.voucher_price) -
                  Number(x.gomdon_ecom_paid || 0);
                // x.offset = Number(x.paid) - Number(x.moneyEXP);
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
              }
              x.offset = obj.offset;
              return x;
            });
            this.rows = [...this.data];
            this.detectCarrier();
            this.temp = this.rows;
            this.moneyExp = this.rows
              .filter((i) => typeof i.shipping_traceno !== 'undefined')
              .reduce((sum, s) => sum + s.moneyEXP, 0); // this.helper.sum(this.rows, 'moneyEXP');
            this.paid = this.rows
              .filter((i) => typeof i.shipping_traceno !== 'undefined')
              .reduce((sum, s) => sum + s.paid, 0); // this.helper.sum(this.rows, 'paid');
            console.log(this.rows);
          });
        } else {
          this.notification.create(
            'error',
            'Lỗi Dữ Liệu',
            'Trong file excel phải chứa thông tin lần rút tiền để đối soát các đơn ở giữa 2 lần rút tiền đó.'
          );
          this.file = undefined;
        }
      } else {
        this.file = undefined;
      }
    } else {
      this.helper.createMessage(
        'Vui lòng tải lên file đúng định dạng excel hoặc csv',
        'error',
        2000
      );
    }
  }

  async createReceipt() {
    const obj: SellCreateReceipt = {
      gomdon_ctime: this.helper.getMiliSec(this.date),
      bank: this.bank,
      note: this.note,
      my_money: this.moneyExp,
      ecom_paid: this.paid,
      orders: this.rows
        .filter(
          (i) =>
            typeof i.shipping_traceno !== 'undefined' &&
            i.gomdon_by &&
            i.gomdon_by.CTVban === this.auth.getInfo().uid
        )
        .map((x) => {
          return {
            transaction_logs: x.transaction_logs || [],
            order_sn: x.id,
            paid: x.paid,
            move_in: x.move_in,
            desc: x.desc,
            offset: x.offset,
            date_receive: x.date,
            gomdon_ecom_paid: x.gomdon_ecom_paid || 0,
          };
        }),
    };
    if (obj.orders.length > 0) {
      this.sellSV.createReceipt(obj).subscribe((res) => {
        if (res.code === 'success') {
          this.helper.createMessage(
            'Tạo thành công phiếu thu, xem trong tab phiếu thu',
            'success'
          );
          this.dis = true;
        }
      });
    } else {
      this.helper.createMessage(
        'KHÔNG CÓ ĐƠN ĐỦ ĐIỀU KIỆN TẠO PHIẾU THU, VUI LÒNG KIỂM TRA LẠI',
        'error'
      );
    }
  }
}
