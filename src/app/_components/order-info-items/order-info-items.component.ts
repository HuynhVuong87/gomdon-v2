import {
  Component,
  OnInit,
  Input,
  ViewChild,
  TemplateRef,
} from '@angular/core';
import { OrderItem } from 'src/app/openapi/model/models';

@Component({
  selector: 'app-order-info-items',
  templateUrl: './order-info-items.component.html',
  styleUrls: ['./order-info-items.component.scss'],
})
export class OrderInfoItemsComponent implements OnInit {
  @ViewChild('imgPrv', { static: true }) imgPrv: TemplateRef<any>;
  @ViewChild('money', { static: true }) moneyView: TemplateRef<any>;
  @ViewChild('linkRef', { static: true }) linkRef: TemplateRef<any>;
  @Input() items: OrderItem[] = [];
  @Input() shop_id: string;
  @Input() mobile: boolean;
  columns = [];
  constructor() {}

  ngOnInit(): void {
    this.columns = [
      {
        prop: 'product.img',
        name: '',
        canAutoResize: false,
        draggable: false,
        resizable: false,
        width: 50,
        cellTemplate: this.imgPrv,
      },
      {
        name: 'TÊN SẢN PHẨM',
        prop: 'product.name',
        key: 'product.item_id',
        cellClass: 'align-left',
        cellTemplate: this.linkRef,
        // flexGrow: 3.5,
        // width: 70
      },
      {
        name: 'PHÂN LOẠI',
        prop: 'item_model.name',
        // flexGrow: 1,
        cellClass: 'align-left',
        width: 60,
      },
      {
        name: 'GIÁ',
        prop: 'item_price',
        // flexGrow: 0.7,
        cellTemplate: this.moneyView,
        width: 70,
      },
      {
        name: 'SL',
        prop: 'amount',
        // flexGrow: 0.3,
        width: 30,
      },
    ];

    this.items.map((x) => {
      x.product['img'] =
        'https://cf.shopee.vn/file/' + x.product.images[0] + '_tn';
    });
  }
}
