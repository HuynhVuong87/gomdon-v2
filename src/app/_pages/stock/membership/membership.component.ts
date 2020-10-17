import { Component, OnInit, OnDestroy } from '@angular/core';
import { FirestoreService } from 'src/app/_services/firestore.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-membership',
  templateUrl: './membership.component.html',
  styleUrls: ['./membership.component.scss'],
})
export class MembershipComponent implements OnInit, OnDestroy {
  emailAdd = '';
  members = [];
  sub: Subscription;
  width: number;
  constructor(private fsSV: FirestoreService) {
    this.width = window.innerWidth;
  }

  ngOnInit(): void {
    this.sub = this.fsSV.getMemberStock().subscribe((l) => (this.members = l));
  }

  async addMember() {
    await this.fsSV.addMemberStock(this.emailAdd);
    this.emailAdd = '';
  }

  async removeMemberStock(email: string) {
    this.fsSV.removeMemberStock(email);
    // await this.test().catch(err => ...)
  }
  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  test() {
    return new Promise((r, j) => {
      setTimeout(() => {
        r();
      }, 3000);
    });
  }
}
