import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  TemplateRef,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { FirestoreService } from '../../_services/firestore.service';
import { Sell } from '../../openapi/model/sell';
import { HelperService } from '../../_services/helper.service';
import { ExcelService } from '../../_services/excel.service';
import { ActivatedRoute } from '@angular/router';
import { DialogsService } from '../../_services/dialogs.service';
import { DialogSetPickComponent } from 'src/app/_dialogs/dialog-set-pick/dialog-set-pick.component';
import { PrintComponent } from 'src/app/_components/print/print.component';
import { ExportService, SellService, UpdateSell } from 'src/app/openapi';
import { DialogChangeStockComponent } from 'src/app/_dialogs/dialog-change-stock/dialog-change-stock.component';
@Component({
  selector: 'app-my-orders',
  templateUrl: './my-orders.component.html',
  styleUrls: ['./my-orders.component.scss'],
})
export class MyOrdersComponent implements OnInit, OnDestroy {
  @ViewChild(PrintComponent) printCPN: PrintComponent;

  @ViewChild('moneyView', { static: true }) moneyView: TemplateRef<any>;
  @ViewChild('dateView', { static: true }) dateView: TemplateRef<any>;
  @ViewChild('linkRef', { static: true }) linkRef: TemplateRef<any>;
  @ViewChild('statusView', { static: true }) statusView: TemplateRef<any>;
  @ViewChild('pickedView', { static: true }) pickedView: TemplateRef<any>;

  toogleThongke = true;
  optionPrint = 'print-orders-barcode';
  rows: Sell[];
  temp: Sell[] = [];
  selected: any[] = [];
  sub: Subscription;
  sub1: Subscription;
  columns = [];
  carriers = [];
  statusList = [];
  type = '';
  mobile: boolean;
  thongke: {
    carrier: string;
    order_sns: {
      order_sn: string;
      shipping_traceno: string;
    }[];
  }[] = [];
  // current_func = '';
  constructor(
    private fsSV: FirestoreService,
    private helper: HelperService,
    private route: ActivatedRoute,
    private dialogSV: DialogsService,
    private xlsxSV: ExcelService,
    private exportSV: ExportService,
    private sellSV: SellService
  ) {
    this.mobile = helper.isMobileScreen;
    this.optionPrint =
      helper.getStorage('option_print') || 'print-orders-barcode';
    console.log(this.optionPrint);
  }

  ngOnInit(): void {
    this.columns = [
      {
        prop: 'selected',
        name: '',
        sortable: false,
        canAutoResize: false,
        draggable: false,
        resizable: false,
        headerCheckboxable: true,
        checkboxable: true,
        width: 38,
        id: '1',
      },
      {
        name: 'MÃ ĐƠN',
        prop: 'order_sn',
        linkRef: 'https://banhang.shopee.vn/portal/sale/',
        key: 'order_id',
        cellTemplate: this.linkRef,
        cellClass: 'align-left',
        id: '2',
      },
      {
        name: 'MÃ VẬN ĐƠN',
        prop: 'shipping_traceno',
        cellClass: 'align-left',
        linkRef: '/order/',
        key: 'order_sn',
        cellTemplate: this.linkRef,
        id: '3',
      },
      {
        name: 'NHÀ VẬN CHUYỂN',
        prop: 'actual_carrier',
        cellClass: 'align-left',
        id: '4',
      },
      {
        name: 'CÔNG NỢ (₫)',
        prop: 'buyer_paid_amount',
        width: 80,
        cellTemplate: this.moneyView,
        cellClass: 'align-right',
        id: '5',
      },
      {
        name: 'PHÍ SHIP (₫)',
        prop: 'shipping_fee',
        width: 80,
        cellTemplate: this.moneyView,
        cellClass: 'align-right',
        id: '6',
      },
      {
        name: 'TẠO NGÀY',
        prop: 'gomdon_ctime',
        cellTemplate: this.dateView,
        width: 86,
        id: '7',
      },
      {
        name: 'PHIẾU XUẤT',
        prop: 'gomdon_export_id',
        key: 'gomdon_export_id',
        linkRef: '/export/',
        cellTemplate: this.linkRef,
        id: '8',
      },
      {
        name: 'TRẠNG THÁI',
        prop: 'gomdon_status',
        cellClass: 'highlight-status',
        cellTemplate: this.statusView,
        id: '9',
      },
      {
        name: 'KHO',
        prop: 'stock.name',
        id: '10',
      },
      {
        name: 'ĐÃ CHIA?',
        prop: 'set_picked',
        id: '11',
        cellTemplate: this.pickedView,
        width: 50,
      },
      {
        name: 'Shop',
        prop: 'gomdon_shop',
        cellClass: 'align-left',
        id: '12',
      },
      {
        name: 'SĐT KHÁCH',
        prop: 'buyer_address_phone',
        id: '13',
      },
      {
        name: 'NICKNAME',
        prop: 'buyer_user.user_name',
        id: '14',
      },
    ];
    this.route.queryParams.subscribe((q) => {
      if (q.type === 'stock') {
        this.hideCol('10');
        this.hideCol('9');
        if (q.status === 'new' || q.status === 'packed') {
          this.snapshotData(`stock_${q.status}`);
          if (q.status === 'packed') {
            this.hideCol('11');
          }
        }
      } else {
        this.hideCol('11');
        this.snapshotData('shop');
      }
    });
    this.helper.setBtns([]);
    this.sub1 = this.helper.action_btns.subscribe((btns) => {
      if (btns.func !== '' && typeof this[btns.func] === 'function') {
        // this.current_func = btns.func;
        this[btns.func]();
      }
    });
  }

  hideCol(id: string) {
    this.columns.splice(
      this.columns.findIndex((x) => x.id === id),
      1
    );
  }

  thongkePacked() {
    this.thongke = [];
    for (const item of this.rows) {
      if (item.gomdon_export_id === undefined || item.gomdon_export_id === '') {
        const ind = this.thongke.findIndex(
          (x) => x.carrier === item.actual_carrier
        );

        if (ind === -1) {
          this.thongke.push({
            carrier: item.actual_carrier,
            order_sns: [
              {
                order_sn: item.order_sn,
                shipping_traceno: item.shipping_traceno,
              },
            ],
          });
        } else {
          this.thongke[ind].order_sns.push({
            order_sn: item.order_sn,
            shipping_traceno: item.shipping_traceno,
          });
        }
      }
    }
  }
  snapshotData(type: string): void {
    this.type = type;
    if (this.sub) {
      this.sub.unsubscribe();
    }
    const idL = this.helper.loadingMessage('Đang tải dữ liệu, vui lòng đợi...');
    this.sub = this.fsSV.snapShotMyOrders(type).subscribe((sells) => {
      this.rows = [...sells];

      if (type === 'stock_packed') {
        this.thongkePacked();
      }
      this.selected = [];
      this.temp = sells;
      this.detectCarrierandStatus();
      this.helper.closeMessage(idL);
    });
  }

  detectCarrierandStatus(): void {
    const carriers = [];
    const status = [];
    for (const item of this.rows) {
      carriers.push(item.actual_carrier);
      status.push(item.gomdon_status);
    }
    this.carriers = [...new Set(carriers)];
    this.statusList = [...new Set(status)];
  }

  ngOnDestroy(): void {
    if (this.sub) {
      this.sub.unsubscribe();
    }
    this.sub1.unsubscribe();
  }

  setPick(): void {
    if (this.selected.some((x) => x.set_picked)) {
      const r = confirm('Tồn tại đơn đã được chia, chấp nhận chia lại?');
      if (!r) {
        return;
      }
    }
    this.dialogSV.openDialog(
      DialogSetPickComponent,
      'Chia Đơn Đi Nhặt',
      this.selected
    );
  }
  searchOrder(e): void {
    this.rows = this.helper.searchOrder(this.temp, e);
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
        {
          func: 'setPick',
          icon: 'usergroup-add',
          title: 'Chia Đơn Đi Nhặt',
          hide:
            this.type === 'stock_new' || this.type === 'stock_packed'
              ? false
              : true,
        },
        {
          func: 'printOrders',
          icon: 'printer',
          title: 'In Mã Vạch',
          hide: this.type === 'shop',
        },
        {
          func: 'changeStock',
          icon: 'shop',
          title: 'Đổi Kho',
          hide: this.type === 'shop' ? false : true,
        },
      ]);
    } else {
      this.helper.setBtns([]);
    }
  }

  changeStock() {
    const check = this.selected.every((x) => x.gomdon_status === 1);
    if (check) {
      this.dialogSV.openDialog(
        DialogChangeStockComponent,
        'Đổi Kho Cho ' + this.selected.length + ' Đơn',
        this.selected
      );
    } else {
      this.helper.createMessage(
        'Chỉ đổi kho với những đơn là đơn mới',
        'error'
      );
    }
  }

  exportExcel() {
    const datas = this.selected;
    const data = this.helper.convertKeyToColName(datas, this.columns);
    this.xlsxSV.exportAsExcelFile(data, 'Đơn bán');
  }
  selectCarrier(e): void {
    this.rows =
      e === 'all' ? this.temp : this.temp.filter((x) => x.actual_carrier === e);
  }

  selectStatus(e): void {
    this.rows =
      e === 'all' ? this.temp : this.temp.filter((x) => x.gomdon_status === e);
  }

  printOrders() {
    this.selected.forEach((d) => {
      const sumlength = [];
      d.order_items.forEach((o) => {
        sumlength.push(o.snapshot_id);
      });
      d['product_quantity'] = [...new Set(sumlength)];
    });

    this.printCPN.excPrint({
      id: this.optionPrint,
      data: this.selected,
    });
  }

  createExport(carrier: string, arr: any[]) {
    this.exportSV.createExport(arr).subscribe((res) => {
      if (res.code === 'success') {
        this.helper.createMessage(
          `Tạo thành công phiếu xuất cho ${arr.length} đơn ${carrier}.`,
          'success',
          4000
        );
      }
    });
  }
}
