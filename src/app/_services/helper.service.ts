import { Injectable, ViewChild } from '@angular/core';
import { BehaviorSubject, merge, fromEvent, Observable, Observer } from 'rxjs';
import { NzMessageService } from 'ng-zorro-antd';
import { DatePipe } from '@angular/common';
import { map } from 'rxjs/operators';

export interface IListBtns {
  title: string;
  func: string;
  icon: string;
  hide?: boolean;
}

export interface IActionButton {
  func: string;
  btns: IListBtns[];
}

@Injectable({
  providedIn: 'root',
})
export class HelperService {
  isMobileScreen = false;
  arrayStatus = [
    {
      id: 0,
      english: 'DRAFT',
      vietnamese: 'đơn nháp',
    },
    {
      id: 1,
      english: 'NEW',
      vietnamese: 'đơn mới',
    },
    {
      id: 2,
      english: 'PREPARED',
      vietnamese: 'đã nhặt đủ hàng để chờ đóng gói',
    },
    {
      id: 3,
      english: 'UNPREPARED',
      vietnamese:
        'chưa nhặt được hàng vì lý do nào đó (ghi lý do vào noteWarehouse)',
    },
    {
      id: 4,
      english: 'PACKED',
      vietnamese: 'đã đóng gói',
    },
    {
      id: 5,
      english: 'SHIPPED',
      vietnamese: 'đã gửi đi',
    },
    {
      id: 6,
      english: 'DELIVERED',
      vietnamese: 'khách đã nhận',
    },
    {
      id: 7,
      english: 'RETURNING',
      vietnamese: 'đang hoàn hàng',
    },
    {
      id: 8,
      english: 'RETURNED',
      vietnamese: 'đã hoàn',
    },
    {
      id: 9,
      english: 'PAID',
      vietnamese: 'đã thanh toán',
    },
    {
      id: 10,
      english: 'REFUNDED',
      vietnamese: 'đã hoàn tiền',
    },
    {
      id: 11,
      english: 'CANCELED',
      vietnamese: 'đã hủy',
    },
  ];

  paymentMethod = [
    {
      id: 1,
      name: 'Thẻ Tín dụng/Ghi nợ',
    },
    {
      id: 6,
      name: 'COD',
    },
    {
      id: 28,
      name: 'Ví Airpay',
    },
    {
      id: 20,
      name: 'Ví Shopee',
    },
    {
      id: 30,
      name: 'Tài khoản ngân hàng đã liên kết AirPay',
    },
  ];

  exportStatus = [
    {
      id: 1,
      name: 'MỚI',
    },
    {
      id: 2,
      name: 'ĐÃ GIAO ĐỦ',
    },
    {
      id: 3,
      name: 'HOÀN THÀNH',
    },
    {
      id: 4,
      name: 'HỦY',
    },
  ];

  idL = '';
  action_btns = new BehaviorSubject<IActionButton>({
    func: '',
    btns: [],
  });

  constructor(private message: NzMessageService, private datePipe: DatePipe) {}

  loadingMessage(text?: string): string {
    this.message.remove(this.idL);
    const id = this.message.loading(text || 'Đang truy vấn, vui lòng đợi...')
      .messageId;
    this.idL = id;
    return id;
  }

  createMessage(content: string, type: string, time?: number) {
    return this.message.create(type, content, {
      nzDuration: time || 3000,
    }).messageId;
  }
  getMiliSec(date?: Date): number {
    const d = date ? new Date(date).getTime() : new Date().getTime();
    // tslint:disable-next-line: no-bitwise
    return (d / 1000) >> 0;
  }

  closeMessage(id: string): void {
    this.message.remove(id);
  }

  setBtns(newBtns: IListBtns[], func: string = ''): void {
    this.action_btns.next({
      func,
      btns: newBtns,
    });
  }

  setStorage(key: string, data: any): void {
    localStorage.setItem(key, data);
  }

  getStorage(key: string): any {
    return localStorage.getItem(key);
  }

  searchOrder(temp: any[], text: string): any[] {
    return text === ''
      ? temp
      : [
          ...temp.filter((x) => {
            text = text.toLowerCase();
            return (
              x.order_sn.toLowerCase().includes(text) ||
              x.shipping_traceno.toLowerCase().includes(text) ||
              x.buyer_user.phone.toLowerCase().includes(text) ||
              x.buyer_user.user_name.toLowerCase().includes(text) ||
              x.actual_carrier.toLowerCase().includes(text)
            );
          }),
        ];
  }

  sortArrObj(arr: any[], prop: string, type: string): any[] {
    if (type.toLowerCase() === 'asc') {
      return arr.sort((a, b) =>
        a[prop] > b[prop] ? 1 : b[prop] > a[prop] ? -1 : 0
      );
    } else {
      return arr.sort((a, b) =>
        a[prop] < b[prop] ? 1 : b[prop] < a[prop] ? -1 : 0
      );
    }
  }

  sum(items: any[], prop: string): number {
    let sum = 0;

    for (const iterator of items) {
      sum += Number(iterator[prop]);
    }

    return sum;
  }

  milisecToDate(value: string | number, format: string) {
    return this.datePipe.transform(
      value === null ? new Date().getTime() : value,
      format
    );
  }

  convertKeyToColName(data, cols) {
    const newData: any[] = [];
    data.forEach((element) => {
      const keys = Object.keys(element);
      const item = {};
      cols.forEach((col) => {
        if (keys.includes(col.prop)) {
          item[col.name] = element[col.prop];
        }
      });
      if (item !== {}) {
        newData.push(item);
      }
    });
    return newData;
  }

  async asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array);
    }
  }

  createOnline$() {
    return merge<boolean>(
      fromEvent(window, 'offline').pipe(map(() => false)),
      fromEvent(window, 'online').pipe(map(() => true)),
      new Observable((sub: Observer<boolean>) => {
        sub.next(navigator.onLine);
        sub.complete();
      })
    );
  }
}
