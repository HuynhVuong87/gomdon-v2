import {
  Component,
  OnInit,
  ViewChild,
  TemplateRef,
  OnDestroy,
} from '@angular/core';
import { HelperService } from 'src/app/_services/helper.service';
import { FirestoreService } from 'src/app/_services/firestore.service';
import { ActivatedRoute } from '@angular/router';
import { Sell, ExportService, ExportUpdateData } from 'src/app/openapi';
import { Subscription } from 'rxjs';
import { ExcelService } from 'src/app/_services/excel.service';

@Component({
  selector: 'app-export-detail',
  templateUrl: './export-detail.component.html',
  styleUrls: ['./export-detail.component.scss'],
})
export class ExportDetailComponent implements OnInit, OnDestroy {
  @ViewChild('moneyView', { static: true }) moneyView: TemplateRef<any>;
  @ViewChild('dateView', { static: true }) dateView: TemplateRef<any>;
  @ViewChild('linkRef', { static: true }) linkRef: TemplateRef<any>;
  @ViewChild('statusView', { static: true }) statusView: TemplateRef<any>;
  export: any;
  id: string;
  rows: Sell[];
  temp: Sell[] = [];
  selected: any[] = [];
  sub: Subscription;
  columns = [];
  statusList = [];
  export_status: ExportUpdateData.GomdonStatusEnum;
  constructor(
    private helper: HelperService,
    private fsSV: FirestoreService,
    private route: ActivatedRoute,
    private xlsxSV: ExcelService,
    private exportSV: ExportService
  ) {
    route.params.subscribe((r) => (this.id = r.id));
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  async ngOnInit() {
    const idL = this.helper.loadingMessage();
    const exp = await this.fsSV.getExportDetail(this.id);
    console.log(exp);
    if (exp) {
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
      this.export = exp;
      this.rows = this.export.gomdon_sells;
      this.helper.closeMessage(idL);
      this.export_status = this.export.gomdon_status;
      this.temp = this.rows;
      this.detectStatus();
      this.sub = this.helper.action_btns.subscribe((btns) => {
        if (btns.func !== '' && typeof this[btns.func] === 'function') {
          // this.current_func = btns.func;
          this[btns.func]();
        }
      });
    } else {
      this.helper.closeMessage(idL);
    }
  }

  changeStatus() {
    const r = confirm(
      `Đổi trạng thái phiếu xuất này sang ${
        this.helper.exportStatus.find((x) => x.id === this.export_status).name
      }?`
    );
    if (r) {
      this.exportSV
        .updateExport({
          data: {
            gomdon_status: this.export_status,
          },
          export_id: this.id,
        })
        .subscribe((res) => {
          if (res.code === 'success') {
            this.helper.createMessage(
              'Đổi trạng thái phiếu xuất thành công.',
              'success'
            );
          } else {
            setTimeout(() => {
              this.export_status = this.export.gomdon_status;
              console.log(this.export_status);
            });
          }
        });
    } else {
      setTimeout(() => {
        this.export_status = this.export.gomdon_status;
        console.log(this.export_status);
      }, 100);
    }
  }
  detectStatus(): void {
    const status = [];
    for (const item of this.rows) {
      status.push(item.gomdon_status);
    }
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
      ]);
    } else {
      this.helper.setBtns([]);
    }
  }
  selectStatus(e): void {
    this.rows =
      e === 'all' ? this.temp : this.temp.filter((x) => x.gomdon_status === e);
  }
  exportExcel() {
    const datas = this.selected;
    const data = this.helper.convertKeyToColName(datas, this.columns);
    this.xlsxSV.exportAsExcelFile(
      data,
      this.export.actual_carrier + '-' + this.id
    );
  }
  selectCarrier(e): void {
    this.rows =
      e === 'all' ? this.temp : this.temp.filter((x) => x.actual_carrier === e);
  }
}
