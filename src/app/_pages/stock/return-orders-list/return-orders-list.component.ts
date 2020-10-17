import {
  Component,
  OnInit,
  ViewChild,
  TemplateRef,
  OnDestroy,
} from '@angular/core';
import { Sell, ExportService } from 'src/app/openapi';
import { Subscription } from 'rxjs';
import { HelperService } from 'src/app/_services/helper.service';
import { FirestoreService } from 'src/app/_services/firestore.service';
import { ExcelService } from 'src/app/_services/excel.service';
import { PrintComponent } from 'src/app/_components/print/print.component';
import { DialogsService } from 'src/app/_services/dialogs.service';
import { DialogScanReturnOrdersComponent } from 'src/app/_dialogs/dialog-scan-return-orders/dialog-scan-return-orders.component';

@Component({
  selector: 'app-return-orders-list',
  templateUrl: './return-orders-list.component.html',
  styleUrls: ['./return-orders-list.component.scss'],
})
export class ReturnOrdersListComponent implements OnInit, OnDestroy {
  @ViewChild(PrintComponent) printCPN: PrintComponent;
  @ViewChild('moneyView', { static: true }) moneyView: TemplateRef<any>;
  @ViewChild('dateView', { static: true }) dateView: TemplateRef<any>;
  @ViewChild('timeReturn', { static: true }) returnTime: TemplateRef<any>;
  @ViewChild('linkRef', { static: true }) linkRef: TemplateRef<any>;
  @ViewChild('statusView', { static: true }) statusView: TemplateRef<any>;
  export: any;
  id: string;
  rows: Sell[];
  temp: Sell[] = [];
  selected: any[] = [];
  sub: Subscription;
  sub1: Subscription;
  columns = [];
  carrierList = [];
  statusList = [];
  constructor(
    private helper: HelperService,
    private fsSV: FirestoreService,
    private xlsxSV: ExcelService,
    private dialogSV: DialogsService
  ) {}

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
        name: 'HOÀN LÚC',
        prop: 'time_return',
        cellTemplate: this.returnTime,
        id: '1.1',
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
    this.sub = this.fsSV.getSellCancels().subscribe((l) => {
      l.forEach((e) => {
        const logs = e.gomdon_logs.filter((x) => +x.content === 8);
        e['time_return'] = logs.length > 0 ? logs[logs.length - 1].id : '';
      });
      this.rows = [...l];
      this.selected = [];
      this.temp = l;
      this.detectCarrier();
    });
    this.sub1 = this.helper.action_btns.subscribe((btns) => {
      if (btns.func !== '' && typeof this[btns.func] === 'function') {
        // this.current_func = btns.func;
        this[btns.func]();
      }
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
    this.sub1.unsubscribe();
  }

  detectCarrier(): void {
    const status = [];
    const carrier = [];
    for (const item of this.rows) {
      carrier.push(item.actual_carrier);
      status.push(item.gomdon_status);
    }
    this.carrierList = [...new Set(carrier)];
    this.statusList = [...new Set(status)];
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
          func: 'printOrders',
          icon: 'printer',
          title: 'In Đơn Hoàn',
        },
      ]);
    } else {
      this.helper.setBtns([]);
    }
  }

  printOrders() {
    let check = null;
    this.selected.forEach((e) => {
      const logs = e.gomdon_logs.filter((x) => +x.content === 8);
      e['time_return'] = logs.length > 0 ? logs[logs.length - 1].id : '';
      if (check !== false) {
        if (check !== null && check !== e.actual_carrier) {
          check = false;
        } else {
          check = e.actual_carrier;
        }
      }
    });
    if (check === false) {
      this.helper.createMessage(
        'Để in đơn hoàn, bạn vui lòng chọn đơn có chung nhà vận chuyển nhé.',
        'error'
      );
      return;
    } else if (this.selected.filter((x) => x.gomdon_status === 11).length > 0) {
      this.helper.createMessage(
        'Để in đơn hoàn, bạn vui lòng không chọn đơn đã hủy.',
        'error'
      );
      return;
    }

    this.printCPN.excPrint({
      id: 'print-return-orders',
      data: this.selected,
    });
  }

  scan() {
    this.dialogSV.openDialog(
      DialogScanReturnOrdersComponent,
      'Xác nhận đơn đã hoàn về kho',
      null
    );
  }

  exportExcel() {
    const datas = this.selected;
    const data = this.helper.convertKeyToColName(datas, this.columns);
    this.xlsxSV.exportAsExcelFile(data, 'Đơn hoàn ');
  }
  selectStatus(e): void {
    this.rows =
      e === 'all' ? this.temp : this.temp.filter((x) => x.gomdon_status === e);
  }
  selectCarrier(e): void {
    this.rows =
      e === 'all' ? this.temp : this.temp.filter((x) => x.actual_carrier === e);
  }
}
