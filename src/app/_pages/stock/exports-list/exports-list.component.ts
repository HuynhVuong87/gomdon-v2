import {
  Component,
  OnInit,
  ViewChild,
  TemplateRef,
  OnDestroy,
} from '@angular/core';
import { HelperService } from 'src/app/_services/helper.service';
import { FirestoreService } from 'src/app/_services/firestore.service';
import { ExportSell } from 'src/app/openapi';
import { Subscription } from 'rxjs';
import { PrintComponent } from 'src/app/_components/print/print.component';

@Component({
  selector: 'app-exports-list',
  templateUrl: './exports-list.component.html',
  styleUrls: ['./exports-list.component.scss'],
})
export class ExportsListComponent implements OnInit, OnDestroy {
  rows: ExportSell[] = [];
  @ViewChild('link', { static: true }) link: TemplateRef<any>;
  @ViewChild('dateView', { static: true }) dateView: TemplateRef<any>;
  @ViewChild(PrintComponent) printCPN: PrintComponent;
  cols: any;
  selected: any[] = [];
  temp = [];
  carriers: string[] = [];
  sub: Subscription;
  constructor(private helper: HelperService, private fsSV: FirestoreService) {}

  async ngOnInit() {
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
        width: 40,
      },
      {
        name: 'NHÀ VẬN CHUYỂN',
        prop: 'actual_carrier',
      },
      {
        name: 'THỜI GIAN TẠO',
        prop: 'gomdon_ctime',
        cellTemplate: this.dateView,
      },
      {
        prop: 'gomdon_sells.length',
        name: 'SỐ LƯỢNG ĐƠN',
      },
      {
        prop: 'id',
        name: 'ID PHIẾU XUẤT',
        cellTemplate: this.link,
      },
    ];

    this.rows = await this.fsSV.getExport();
    this.temp = this.rows;
    this.detectCarrier();
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
    console.log(e);
    const text = e.toLowerCase();
    this.rows =
      text === ''
        ? this.temp
        : [...this.temp.filter((x) => x.id.toLowerCase().includes(text))];
  }
  detectCarrier(): void {
    const carriers = [];
    for (const item of this.rows) {
      carriers.push(item['actual_carrier']);
    }
    this.carriers = [...new Set(carriers)];
  }
  selectCarrier(e): void {
    this.rows =
      e === 'all' ? this.temp : this.temp.filter((x) => x.actual_carrier === e);
  }
  onSelect({ selected }) {
    this.selected.splice(0, this.selected.length);
    this.selected.push(...selected);

    if (this.selected.length > 0) {
      this.helper.setBtns([
        {
          func: 'printExport',
          icon: 'printer',
          title: 'In Phiếu Xuất',
        },
      ]);
    } else {
      this.helper.setBtns([]);
    }
  }

  printExport() {
    this.printCPN.excPrint({
      id: 'print-exports',
      data: this.selected,
    });
  }
}
