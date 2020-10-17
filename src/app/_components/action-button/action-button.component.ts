import { Component, OnInit, OnDestroy } from '@angular/core';
import { HelperService, IListBtns } from 'src/app/_services/helper.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-action-button',
  templateUrl: './action-button.component.html',
  styleUrls: ['./action-button.component.scss'],
})
export class ActionButtonComponent implements OnInit, OnDestroy {
  listBtns: IListBtns[] = [];
  sub: Subscription;
  constructor(private helper: HelperService) {}

  ngOnInit(): void {
    this.helper.setBtns([]);
    this.helper.action_btns.subscribe((l) => {
      this.listBtns = l.btns;
    });
  }

  ngOnDestroy(): void {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }

  fireFunc(func: string): void {
    this.helper.setBtns(this.listBtns, func);
  }
}
