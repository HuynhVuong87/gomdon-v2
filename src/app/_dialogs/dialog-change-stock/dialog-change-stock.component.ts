import { Component, OnInit } from '@angular/core';
import { Sell } from 'src/app/openapi';
import { NzModalRef } from 'ng-zorro-antd';
import { HelperService } from 'src/app/_services/helper.service';
import { FirestoreService } from 'src/app/_services/firestore.service';

@Component({
  selector: 'app-dialog-change-stock',
  templateUrl: './dialog-change-stock.component.html',
  styleUrls: ['./dialog-change-stock.component.scss'],
})
export class DialogChangeStockComponent implements OnInit {
  data: Sell[];
  list: any[];
  selectStock: string;
  constructor(
    private modal: NzModalRef,
    private helper: HelperService,
    private fsSV: FirestoreService
  ) {}

  async ngOnInit() {
    this.list = await this.fsSV.getListStock();
    console.log(this.list);
  }
  destroyModal() {
    this.modal.destroy();
  }
  async save() {
    console.log(this.selectStock, this.list);
    const stock = this.list.find((x) => x.uid === this.selectStock);
    if (stock) {
      console.log(stock, this.data);
      const { uid, email, displayName } = stock;
      await this.fsSV.setStockSells(
        { uid, email, name: displayName },
        this.data.map((x) => x.order_sn)
      );
      this.modal.destroy();
      this.helper.createMessage('Đã đổi kho', 'success');
    }
  }
}
