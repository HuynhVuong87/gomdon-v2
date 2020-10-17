import { Injectable } from '@angular/core';
import * as firebase from 'firebase';
import {
  AngularFirestoreCollection,
  AngularFirestore,
  AngularFirestoreDocument,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { Sell } from '../openapi/model/sell';
import { HelperService } from './helper.service';

// const db = firebase.firestore();
let db: firebase.firestore.Firestore;

@Injectable({
  providedIn: 'root',
})
export class FirestoreService {
  sellsCol = 'sells';

  constructor(
    private afs: AngularFirestore,
    private auth: AuthService,
    private helper: HelperService
  ) {
    db = afs.firestore;
  }

  async test() {
    const docs = await db.collection('sells').get();
    docs.forEach(async (doc) => {
      await db.collection('sells').doc(doc.id).update({ test: 1 });
      console.log('done');
    });
  }

  async getDoc(col: string, doc: string, hideLoading?: boolean) {
    const idL = hideLoading
      ? ''
      : this.helper.loadingMessage('Đang Truy Vấn...');
    const data = await db.collection(col).doc(doc).get();
    this.helper.closeMessage(idL);
    if (data.exists) {
      return Object.assign({ _id: data.id }, data.data());
    } else {
      return;
    }
  }

  async deleteDoc(col: string, doc: string) {
    const idL = this.helper.loadingMessage('Đang xóa...');
    await db.collection(col).doc(doc).delete();
    this.helper.closeMessage(idL);
    return true;
  }

  async setDoc(
    col: string,
    doc: string,
    data: any,
    create?: boolean,
    stopL?: boolean
  ) {
    const idL = stopL ? '' : this.helper.loadingMessage('Đang Lưu...');
    const ref =
      doc.length > 0 ? db.collection(col).doc(doc) : db.collection(col).doc();

    data[create ? 'ctime' : 'mtime'] = this.helper.getMiliSec();
    if (create) {
      const { uid, displayName } = this.auth.getInfo();
      if (uid) {
        data.create_by = { uid, name: displayName };
      }
    }

    await ref
      .set(data, {
        merge: true,
      })
      .catch((err) => {
        this.helper.closeMessage(idL);
        this.helper.createMessage('Có Lỗi Xảy Ra...', 'error', 5000);
        return;
      });
    // tslint:disable-next-line: no-unused-expression
    stopL ? '' : this.helper.closeMessage(idL);
    // tslint:disable-next-line: no-unused-expression
    stopL ? '' : this.helper.createMessage('Đã Lưu.', 'success', 1500);
    return ref.id;
  }
  async getCol(collection: string) {
    return new Promise<firebase.firestore.DocumentData[]>((resolve, reject) => {
      db.collection(collection)
        .get()
        .then((snap) => {
          const data = snap.docs.map((doc) => {
            const obj = doc.data();
            obj.gomdon_id = doc.id;
            return obj;
          });
          resolve(data);
        })
        .catch((err) => reject(err));
    });
  }

  snapShotMyOrders(type: string): Observable<Sell[]> {
    return this.afs
      .collection(this.sellsCol, (ref) => {
        const uid = this.auth.getInfo().uid;
        if (type === 'stock_new') {
          return ref
            .where('gomdon_status', '==', 1)
            .where('stock.uid', '==', uid);
        }
        if (type === 'stock_packed') {
          return ref
            .where('gomdon_status', '==', 4)
            .where('stock.uid', '==', uid);
        }

        return ref
          .where('gomdon_status', '>=', 0)
          .where('gomdon_status', '<=', 4)
          .where('gomdon_by.CTVban', '==', uid);
      })
      .valueChanges() as Observable<Sell[]>;
  }

  // tslint:disable-next-line: typedef
  snapShotOrderDetail(order_sn: string) {
    return this.afs
      .collection(this.sellsCol)
      .doc(order_sn)
      .valueChanges() as Observable<Sell>;
  }

  // get danh sach nhan vien kho
  getMemberStock(): Observable<unknown[]> {
    const uid = this.auth.getInfo().uid;
    return this.afs
      .collection('users')
      .doc(uid)
      .collection('members_info')
      .valueChanges();
  }

  // xoa nhan vien kho

  async removeMemberStock(email: string) {
    const { uid } = this.auth.getInfo();
    const batch = db.batch();
    const memeberRef = db
      .collection('users')
      .doc(uid)
      .collection('members_info')
      .doc(email);
    batch.delete(memeberRef);
    batch.update(db.collection('users').doc(uid), {
      isMemberOf: null,
    });
    await batch.commit();
    this.helper.createMessage('Xóa thành công nhân viên kho.', 'success');
  }

  // quanlykho them nhan vien
  async addMemberStock(email: string) {
    const { uid, displayName } = this.auth.getInfo();
    if (uid !== email) {
      const docs = await db
        .collection('users')
        .where('email', '==', email)
        .get();
      if (docs.size === 1) {
        const idL = this.helper.loadingMessage();
        docs.forEach(async (doc) => {
          const isMemberOf = doc.data().isMemberOf || null;
          if (isMemberOf !== null && isMemberOf.uid !== uid) {
            this.helper.createMessage(
              'Người dùng này đang là nhân viên thuộc kho khác.',
              'error'
            );
          } else {
            const infoMem = doc.data();
            const batch = db.batch();
            const memeberRef = db
              .collection('users')
              .doc(uid)
              .collection('members_info')
              .doc(email);
            batch.set(memeberRef, {
              uid: infoMem.uid,
              displayName: infoMem.displayName,
              email,
              photoURL: infoMem.photoURL,
              ctime: this.helper.getMiliSec(),
            });
            batch.update(db.collection('users').doc(infoMem.uid), {
              isMemberOf: {
                uid,
                displayName,
                email: this.auth.getInfo().email,
              },
            });
            await batch.commit();
            this.helper.createMessage(
              'Thêm thành công nhân viên kho.',
              'success'
            );
          }
          this.helper.closeMessage(idL);
        });
      } else {
        this.helper.createMessage(
          'Người dùng không tồn tại, vui lòng thử lại.',
          'error'
        );
      }
    } else {
      this.helper.createMessage(
        'Bạn không thể thêm chính mình làm nhân viên kho',
        'error'
      );
    }
  }

  async getExport() {
    const uid = this.auth.getInfo().uid;
    const data = [];
    const docs = await db
      .collection('export_sells')
      .where('gomdon_status', '==', 1)
      .where('create_by', '==', uid)
      .get();
    docs.forEach((doc) => data.push(Object.assign({ id: doc.id }, doc.data())));
    return data;
  }

  async getExportDetail(id: string) {
    const ex = await this.getDoc('export_sells', id, true);
    if (ex) {
      ex.gomdon_sells = [];
      const docs = await this.afs.firestore
        .collection('sells')
        .where('gomdon_export_id', '==', id)
        .get();
      docs.forEach((doc) => {
        ex.gomdon_sells = [...ex.gomdon_sells, doc.data()];
      });
      // await this.helper.asyncForEach(ex.gomdon_sells, async (e, i) => {
      //   const sell = await this.getDoc('sells', e.order_sn, true);
      //   ex.gomdon_sells[i] = sell;
      // });
      return ex;
    }
  }

  getSellCancels() {
    const dt = new Date();
    dt.setDate(dt.getDate() - 30);
    const uid = this.auth.getInfo().uid;
    return this.afs
      .collection('sells', (ref) =>
        ref
          .where('gomdon_status', 'in', [8, 11])
          .where('gomdon_ctime', '>=', this.helper.getMiliSec(dt))
          .where('stock.uid', '==', uid)
      )
      .valueChanges() as Observable<Sell[]>;
  }

  async getListStock() {
    const list = [];
    const uid = this.auth.getInfo().uid;
    const docs = await this.afs.firestore
      .collection('users')
      .doc(uid)
      .collection('stocks_info')
      .get();
    docs.forEach((doc) => {
      list.push(doc.data());
    });
    return list;
  }

  async setStockSells(
    stock: { uid: string; email: string; name: string },
    sells: string[]
  ) {
    const batch = firebase.firestore().batch();
    const colRef = firebase.firestore().collection('sells');
    const { uid, email, name } = stock;
    for (const order_sn of sells) {
      batch.update(colRef.doc(order_sn), {
        stock: { uid, email, name },
      });
    }
    await batch.commit();
  }

  subExportLength() {
    return this.afs
      .collection('export_sells', (ref) => ref.where('gomdon_status', '==', 1))
      .valueChanges();
  }
}
