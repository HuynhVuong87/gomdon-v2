import {
  Component,
  OnInit,
  ElementRef,
  ViewChild,
  OnDestroy,
  TemplateRef,
} from '@angular/core';
import { HelperService } from 'src/app/_services/helper.service';
import { EsSearchService } from 'src/app/_services/es-search.service';
import { SellService } from 'src/app/openapi';
import { Subscription } from 'rxjs';
import { ExcelService } from 'src/app/_services/excel.service';
@Component({
  selector: 'app-search-side',
  templateUrl: './search-side.component.html',
  styleUrls: ['./search-side.component.scss'],
})
export class SearchSideComponent implements OnInit, OnDestroy {
  @ViewChild('inpt') inpt: ElementRef<any>;
  @ViewChild('moneyView', { static: true }) moneyView: TemplateRef<any>;
  @ViewChild('dateView', { static: true }) dateView: TemplateRef<any>;
  @ViewChild('linkRef', { static: true }) linkRef: TemplateRef<any>;
  @ViewChild('status', { static: true }) statusView: TemplateRef<any>;
  @ViewChild('payMethod', { static: true }) payMethod: TemplateRef<any>;
  searchText = '';
  list_suggest = [];
  loading = false;
  searchMulti = [];
  rows = [];
  cols = [];
  idM = '';
  selected = [];
  sub: Subscription;
  constructor(
    private helper: HelperService,
    private esSV: EsSearchService,
    private sellSV: SellService,
    private xlsxSV: ExcelService
  ) {}

  ngOnInit(): void {
    this.cols = [
      {
        prop: 'selected',
        name: '',
        sortable: false,
        canAutoResize: false,
        draggable: false,
        resizable: false,
        headerCheckboxable: true,
        checkboxable: true,
        width: 37,
      },
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
        linkRef: '/order/',
        key: 'order_sn',
        cellClass: 'align-left',
        cellTemplate: this.linkRef,
      },
      {
        name: 'Shop',
        prop: 'gomdon_shop',
        cellClass: 'align-left',
      },
      {
        name: 'NHÀ VẬN CHUYỂN',
        prop: 'actual_carrier',
        cellClass: 'align-left',
      },
      {
        name: 'PHIẾU XUẤT',
        prop: 'gomdon_export_id',
        key: 'gomdon_export_id',
        linkRef: '/export/',
        cellTemplate: this.linkRef,
      },
      {
        name: 'CÔNG NỢ (₫)',
        prop: 'buyer_paid_amount',
        width: 80,
        cellTemplate: this.moneyView,
      },
      {
        name: 'PHÍ SHIP (₫)',
        prop: 'shipping_fee',
        width: 80,
        cellTemplate: this.moneyView,
      },
      {
        name: 'TẠO NGÀY',
        prop: 'gomdon_ctime',
        cellTemplate: this.dateView,
      },
      {
        name: 'TRẠNG THÁI',
        prop: 'gomdon_status',
        key: 'Sell',
        cellTemplate: this.statusView,
      },
    ];
    setTimeout(() => {
      this.inpt.nativeElement.focus();
    }, 500);
    this.sub = this.helper.action_btns.subscribe((btns) => {
      if (btns.func !== '' && typeof this[btns.func] === 'function') {
        // this.current_func = btns.func;
        this[btns.func]();
      }
    });
  }
  ngOnDestroy() {
    this.sub.unsubscribe();
    this.helper.setBtns([]);
  }

  async textChange() {
    this.helper.closeMessage(this.idM);
    this.idM = this.helper.createMessage(
      'Vì một số lỗi đang khắc phục nên bạn cần nhập đủ mã vận đơn.',
      'warning'
    );
    if (this.searchText !== '') {
      let texts = [];
      this.searchText.split('\n').forEach((x) => {
        if (x.length > 0) {
          texts.push(x.trim());
        }
      });
      texts = [...new Set(texts)];
      if (texts.length === 1) {
        this.searchMulti = [];
        this.loading = true;
        this.list_suggest = await this.esSV.searchSell(this.searchText);
        this.loading = false;
      } else {
        this.list_suggest = [];
        this.searchMulti = texts;
      }
    } else {
      this.list_suggest = [];
    }
  }

  searchMultiAtc() {
    this.sellSV.getByIdsSell(this.searchMulti).subscribe((res: any) => {
      this.rows = res.filter((x) => x.code === 'success').map((x) => x.data);
      this.selected = [];
    });
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
