import {
  Component,
  ChangeDetectionStrategy,
  AfterViewInit,
} from '@angular/core';
import { Sell, User } from 'src/app/openapi';
import { Subscription } from 'rxjs';
import { HelperService } from 'src/app/_services/helper.service';
import { FirestoreService } from 'src/app/_services/firestore.service';
import { AuthService } from 'src/app/_services/auth.service';
import { NzModalRef } from 'ng-zorro-antd';
import { AngularFirestore } from '@angular/fire/firestore';

interface IUserPick extends User {
  selected: boolean;
  setPick: any[];
}

@Component({
  // changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-dialog-set-pick',
  templateUrl: './dialog-set-pick.component.html',
  styleUrls: ['./dialog-set-pick.component.scss'],
})
export class DialogSetPickComponent implements AfterViewInit {
  data: Sell[];
  users = [] as IUserPick[];
  sub: Subscription;
  orderItem = [];
  modelsNeedPick: any[] = [];
  task: {
    user_info: {
      uid: string;
      name: string;
      email: string;
    };
    model_need_pick: any;
  }[] = [];
  myUid: string;
  constructor(
    private helper: HelperService,
    private fsSV: FirestoreService,
    private authSV: AuthService,
    private modal: NzModalRef,
    private afs: AngularFirestore
  ) {
    this.myUid = authSV.getInfo().uid;
  }

  ngAfterViewInit(): void {
    this.data.forEach((element: Sell) => {
      element.order_items.map((x) => {
        x['gomdon_id'] = element.order_sn;
      });
      this.orderItem = this.orderItem.concat(element.order_items);
    });
    console.log(this.orderItem);
    this.orderItem.forEach((item) => {
      const ind = this.modelsNeedPick.findIndex(
        // tslint:disable-next-line: triple-equals
        (x) => x.model_id == item.item_model.model_id
      );
      if (ind === -1) {
        this.modelsNeedPick.push({
          name: item.item_model.name,
          product_name: item.product.name.replace(/\[.*]/, '').trim(),
          product_id: item.product.snapshot_id.toString(),
          sku: item.item_model.sku,
          sku_product: item.product.sku,
          amount: item.amount,
          order_sn: [item.gomdon_id],
          item_id: item.item_id.toString(),
          image: item.product.images[0],
          images: item.product.images,
          model_id:
            item.item_model.model_id !== 0
              ? item.item_model.model_id
              : item.item_id,
        });
      } else {
        if (!this.modelsNeedPick[ind].order_sn.includes(item.gomdon_id)) {
          this.modelsNeedPick[ind].order_sn.push(item.gomdon_id);
        }
        this.modelsNeedPick[ind].amount += item.amount;
      }
    });
    console.log(this.modelsNeedPick);
    this.modelsNeedPick = this.helper.sortArrObj(
      this.modelsNeedPick,
      'amount',
      'desc'
    );

    this.sub = this.fsSV.getMemberStock().subscribe((data: IUserPick[]) => {
      const { uid, email, displayName, photoURL } = this.authSV.getInfo();
      this.users = data.map((x) => {
        x.selected = false;
        return x;
      });
      this.users = [
        {
          uid,
          email,
          displayName,
          photoURL,
          selected: false,
          setPick: [],
        },
        ...this.users,
      ];
    }) as any;
  }

  selected() {
    this.users.forEach((x) => {
      // tslint:disable-next-line: no-unused-expression
      x.selected ? '' : delete x.setPick;
    });
    this.setPick(
      this.modelsNeedPick,
      this.users.filter((x) => x.selected === true)
    );
  }

  setPick(items: any[], users: IUserPick[]) {
    this.task = [];
    if (users.length > 0) {
      if (users.length === 1) {
        users[0].setPick = items;
      } else {
        users = users.map((x) => {
          x.setPick = [];
          return x;
        });
        const averageItem = Math.round(
          this.count(items, 'model_id') / users.length
        );
        let ind = 0;
        items.forEach((item, i) => {
          const currentItem = this.count(users[ind].setPick, 'model_id');
          const incomeItem = currentItem + 1;
          if (incomeItem <= averageItem) {
            users[ind].setPick.push(item);
          } else {
            const arr = users.map((x) => {
              return {
                amount: this.helper.sum(x.setPick, 'amount'),
                uid: x.uid,
              };
            });
            const check = this.helper.sortArrObj(arr, 'amount', 'asc');
            const index = users.findIndex((x) => x.uid === check[0].uid);
            users[index].setPick.push(item);
          }
          ind = ind + 1 === users.length ? 0 : ind + 1;
        });
      }
    }
    console.log(this.users);
  }

  count(arr: any[], prop: string) {
    return [...new Set(arr.map((item) => item[prop]))].length;
  }

  destroyModal() {
    this.modal.destroy();
  }

  save() {
    const arr = this.users.filter((x) => x.setPick && x.setPick.length > 0);
    if (arr.length > 0) {
      const batch = this.afs.firestore.batch();
      arr.forEach((el) => {
        const id = this.afs.createId();
        const docRef = this.afs.firestore.collection('pick_models').doc(id);
        batch.set(docRef, {
          gomdon_ctime: this.helper.getMiliSec(),
          uid: el.uid,
          successed: false,
          model_size: el.setPick.length,
        });

        el.setPick.forEach((e) => {
          const elRef = docRef
            .collection('models_need_pick')
            .doc(e.model_id.toString());
          batch.set(elRef, e);
        });

        el.setPick.forEach((item) => {
          item.order_sn.forEach((e) => {
            const ind1 = this.data.findIndex((x) => x.order_sn === e);
            const ind2 = this.data[ind1].order_items.findIndex(
              // tslint:disable-next-line: triple-equals
              (x) =>
                x.model_id === 0
                  ? x.item_id == item.model_id
                  : x.model_id == item.model_id
            );
            // tslint:disable-next-line: no-unused-expression
            this.data[ind1].order_items[ind2]['pick_by'] = {
              name: el.displayName,
              email: el.email,
              uid: el.uid,
            };
          });
        });
      });
      this.data.forEach((order: Sell) => {
        const docRef = this.afs.firestore
          .collection('sells')
          .doc(order.order_sn);
        batch.update(docRef, {
          set_picked: true,
          order_items: order.order_items,
        });
      });
      batch.commit().then(() => {
        this.helper.createMessage('Chia đơn thành công.', 'success');
        this.modal.close();
      });
    } else {
      this.helper.createMessage('Vui lòng chia trước khi lưu.', 'error');
    }
  }
}
