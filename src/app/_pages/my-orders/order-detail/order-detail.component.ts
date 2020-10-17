import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FirestoreService } from 'src/app/_services/firestore.service';
import { AuthService } from 'src/app/_services/auth.service';
import { HelperService } from 'src/app/_services/helper.service';
import { Sell } from 'src/app/openapi/model/sell';
import { SellService } from 'src/app/openapi/api/sell.service';
import { GomdonLogs } from 'src/app/openapi';
import { DecimalPipe } from '@angular/common';

export interface ILogsDetail {
  title: string;
  id: number;
  logs: GomdonLogs[];
  icon: string;
}

@Component({
  selector: 'app-order-detail',
  templateUrl: './order-detail.component.html',
  styleUrls: ['./order-detail.component.scss'],
})
export class OrderDetailComponent implements OnInit {
  order_sn: string;
  sell: Sell;
  notfound = false;
  ownPrice = 0;
  disableSaveNote = true;
  visibleLogsView = false;
  timelineStatus = {
    current: 0,
    statuses: [
      {
        id: '1',
        title: 'Đơn Mới',
        icon: 'plus-circle',
      },
      {
        id: '4',
        title: 'Đã Đóng Gói',
        icon: 'appstore',
      },
      {
        id: '5',
        title: 'Đã Gửi Đi',
        icon: 'send',
      },
      {
        id: '8',
        title: 'Đã Hoàn',
        icon: 'reload',
      },
      {
        id: '11',
        title: 'Đã Hủy',
        icon: 'delete',
      },
    ],
  };
  mobile: boolean;
  logsView: ILogsDetail[] = [];
  constructor(
    private route: ActivatedRoute,
    private fsSV: FirestoreService,
    private authSV: AuthService,
    private helper: HelperService,
    private sellSV: SellService,
    private decimaPipe: DecimalPipe
  ) {
    route.params.subscribe((p) => {
      this.order_sn = p.id;
      this.mobile = helper.isMobileScreen;
    });
  }

  ngOnInit(): void {
    this.getData();
  }

  getData(): void {
    const idL = this.helper.loadingMessage('Đang tải dữ liệu, vui lòng đợi...');
    this.fsSV.snapShotOrderDetail(this.order_sn).subscribe((sell) => {
      const uid = this.authSV.getInfo().uid;
      this.helper.closeMessage(idL);
      if (sell && (sell.gomdon_by.CTVban === uid || sell.stock.uid === uid)) {
        this.sell = sell;
        console.log(sell);
        this.logStatus();
      } else {
        this.notfound = true;
      }
    });
  }

  openLogsView(): void {
    this.logsView = [
      {
        id: 1,
        title: 'Trạng Thái',
        icon: 'appstore-add',
        logs: this.helper.sortArrObj(
          this.sell.gomdon_logs.filter((x) => x.type === 0),
          'id',
          'desc'
        ),
      },
      {
        id: 2,
        title: 'Ghi Chú',
        icon: 'form',
        logs: this.helper.sortArrObj(
          this.sell.gomdon_logs.filter((x) => x.type === 1),
          'id',
          'desc'
        ),
      },
      {
        id: 3,
        title: 'Thanh Toán',
        icon: 'wallet',
        logs: this.sell.transaction_logs
          ? this.helper.sortArrObj(
              this.sell.transaction_logs.map(
                (x) =>
                  new Object({
                    id: x.gomdon_ctime,
                    content: `${this.decimaPipe.transform(
                      x.money_receive,
                      '1.0-0'
                    )}`,
                    name: x.move_in,
                  })
              ),
              'id',
              'desc'
            )
          : [],
      },
    ];
    this.visibleLogsView = true;
  }

  logStatus(): void {
    this.sell.gomdon_logs
      .filter((x) => x.type === 0)
      .forEach((l) => {
        const ind = this.timelineStatus.statuses.findIndex(
          (x) => +x.id === +l.content
        );
        this.timelineStatus.statuses[ind]['name'] = l.name;
        this.timelineStatus.statuses[ind]['time'] = l.id;
      });
    this.timelineStatus.current = this.timelineStatus.statuses.findIndex(
      (x) => +x.id === +this.sell.gomdon_status
    );
  }
  changeStatus(status: string): void {
    this.sellSV
      .updateSell([{ id: this.order_sn, data: { gomdon_status: +status } }])
      .subscribe((res) => {
        if (res[0].code === 'success') {
          this.helper.createMessage('Đã đổi trạng thái.', 'success');
        }
      });
  }

  saveNote(): void {
    this.sellSV
      .updateSell([
        { id: this.order_sn, data: { gomdon_note: this.sell.gomdon_note } },
      ])
      .subscribe((res) => {
        if (res[0].code === 'success') {
          this.helper.createMessage('Đã cập nhật ghi chú.', 'success');
        }
      });
  }

  async viewPosition() {
    const exp = await this.fsSV.getDoc(
      'export_sells',
      this.sell.gomdon_export_id
    );
    const ind = exp.gomdon_sells.findIndex((x) => x.order_sn === this.order_sn);
    alert('Vị trí của đơn này trong phiếu xuất là ' + ind + 1);
  }
}
