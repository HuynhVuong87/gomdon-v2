import {
  Component,
  OnInit,
  ViewChild,
  TemplateRef,
  OnDestroy,
} from '@angular/core';
import { ExportSell, ReceiptService } from 'src/app/openapi';
import { PrintComponent } from 'src/app/_components/print/print.component';
import { Subscription } from 'rxjs';
import { HelperService } from 'src/app/_services/helper.service';
import { FirestoreService } from 'src/app/_services/firestore.service';

@Component({
  selector: 'app-receipt-list',
  templateUrl: './receipt-list.component.html',
  styleUrls: ['./receipt-list.component.scss'],
})
export class ReceiptListComponent implements OnInit, OnDestroy {
  rows: ExportSell[] = [];
  @ViewChild('moneyView', { static: true }) moneyView: TemplateRef<any>;
  @ViewChild('dateView', { static: true }) dateView: TemplateRef<any>;
  @ViewChild('linkRef', { static: true }) linkRef: TemplateRef<any>;
  cols: any;
  selected: any[] = [];
  temp = [];
  carriers: string[] = [];
  sub: Subscription;
  constructor(
    private helper: HelperService,
    private receiptSV: ReceiptService
  ) {}

  async ngOnInit() {
    this.cols = [
      {
        name: 'id',
        prop: 'gomdon_id',
        cellTemplate: this.linkRef,
      },
      {
        name: 'note',
        prop: 'note',
      },
      {
        name: 'Ngày tạo',
        prop: 'gomdon_ctime',
        cellTemplate: this.dateView,
      },
      {
        name: 'Ngày nhận',
        prop: 'date_receive',
        cellTemplate: this.dateView,
      },
      {
        name: 'Công nợ',
        prop: 'my_money',
        cellClass: 'align-right',
        cellTemplate: this.moneyView,
      },
      {
        name: 'sàn trả',
        prop: 'ecom_paid',
        cellClass: 'align-right',
        cellTemplate: this.moneyView,
      },
      {
        name: 'đối soát',
        prop: 'offset',
        cellClass: 'align-right',
        cellTemplate: this.moneyView,
      },
    ];

    this.receiptSV.getReceipt().subscribe((res: any) => {
      console.log(res);
      const data = res.data.map((x) => {
        x.offset = x.ecom_paid - x.my_money;
        return x;
      });
      this.rows = [...data];
      this.temp = this.rows;
    });
    this.sub = this.helper.action_btns.subscribe((btns) => {
      if (btns.func !== '' && typeof this[btns.func] === 'function') {
        this[btns.func]();
      }
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  search(e) {
    this.rows = this.helper.searchOrder(this.temp, e);
  }
  // onSelect({ selected }) {
  //   this.selected.splice(0, this.selected.length);
  //   this.selected.push(...selected);

  //   if (this.selected.length > 0) {
  //     this.helper.setBtns([
  //       {
  //         func: 'printExport',
  //         icon: 'printer',
  //         title: 'In Phiếu Xuất',
  //       },
  //     ]);
  //   } else {
  //     this.helper.setBtns([]);
  //   }
  // }
}
