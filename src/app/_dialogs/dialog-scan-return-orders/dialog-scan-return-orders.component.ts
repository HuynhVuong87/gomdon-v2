import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { NzModalRef } from 'ng-zorro-antd';
import { HelperService } from 'src/app/_services/helper.service';
import { SellService } from 'src/app/openapi';

@Component({
  selector: 'app-dialog-scan-return-orders',
  templateUrl: './dialog-scan-return-orders.component.html',
  styleUrls: ['./dialog-scan-return-orders.component.scss'],
})
export class DialogScanReturnOrdersComponent implements OnInit {
  @ViewChild('inpt') inpt: ElementRef<any>;
  constructor(
    private modal: NzModalRef,
    private helper: HelperService,
    private sellSV: SellService
  ) {}
  value = '';
  auto = false;
  disableInput = false;
  list: {
    id: string;
    status: string;
    mvd: string;
  }[] = [];
  ngOnInit(): void {
    this.auto = this.helper.getStorage('autoScanInput') || false;
    setTimeout(() => {
      this.inpt.nativeElement.focus();
    }, 100);
  }

  destroyModal() {
    this.modal.close();
  }

  changeAuto() {
    this.helper.setStorage('autoScanInput', this.auto);
  }
  playSound(sound: string) {
    sound = 'assets/audio/' + sound + '.mp3';
    // tslint:disable-next-line: no-unused-expression
    const audio = new Audio();
    audio.src = sound;
    audio.load();
    audio.play();
  }

  autoCheck() {
    if (this.auto && this.value.length > 0) {
      this.checkOrder();
    }
  }
  checkOrder() {
    const mvd = this.value.trim();
    if (mvd.length > 0) {
      this.disableInput = true;
      this.sellSV.getByIdsSell([mvd]).subscribe(async (res: any[]) => {
        const sell = res[0];

        const addList = (id: string, status: string) => {
          this.list = [
            {
              id,
              status,
              mvd,
            },
            ...this.list,
          ];
          this.value = '';
          this.disableInput = false;
          setTimeout(() => {
            this.inpt.nativeElement.focus();
          }, 0);
        };

        if (
          sell.code === 'error' &&
          sell.data.message === 'đơn không tồn tại'
        ) {
          this.playSound('notfound');
          addList(undefined, 'Không tồn tại');
        } else if (sell.code === 'success') {
          // if (this.task === 1) {
          const status = sell.data.gomdon_status;
          switch (true) {
            case status < 5:
              this.playSound('chuaguidi');
              addList(sell.data.order_sn, 'Chưa gửi đi');
              break;
            case status === 5 || status === 6:
              this.sellSV
                .updateSell([
                  {
                    id: sell.data.order_sn,
                    data: {
                      gomdon_status: 8,
                    },
                  },
                ])
                .subscribe(async (res1) => {
                  if (res1[0].code === 'success') {
                    this.playSound('hoan');
                    addList(sell.data.order_sn, 'Đã hoàn');
                  }
                });
              break;
            case status === 8:
              this.playSound('dahoan');
              addList(sell.data.order_sn, 'Đã hoàn');
              break;
          }
          // }
        }
        // this.loading = false;
      });
    } else {
      this.helper.createMessage(
        'Vui lòng nhập mã vận đơn trước khi xác nhận.',
        'error'
      );
    }
  }
}
