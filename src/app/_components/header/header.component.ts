import { Component, OnInit, NgZone } from '@angular/core';
import { AuthService, IInfo } from 'src/app/_services/auth.service';
import { NzDrawerService } from 'ng-zorro-antd';
import { ChatSideComponent } from '../chat-side/chat-side.component';
import { HelperService } from 'src/app/_services/helper.service';
import { FirestoreService } from 'src/app/_services/firestore.service';
import { SearchSideComponent } from '../search-side/search-side.component';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  info: IInfo;
  isOnline: boolean;
  mobile: boolean;
  constructor(
    private authSV: AuthService,
    private ngZone: NgZone,
    private drawerService: NzDrawerService,
    private helper: HelperService,
    private fsSV: FirestoreService
  ) {}

  ngOnInit(): void {
    // this.fsSV.test();
    this.authSV.current_user.subscribe((u) => {
      this.ngZone.run(() => {
        this.info = u !== null ? u : undefined;
      });
    });
    this.mobile = this.helper.isMobileScreen;
    this.helper.createOnline$().subscribe((isOnline) => {
      this.isOnline = isOnline;
      let idL;
      if (isOnline === false) {
        idL = this.helper.loadingMessage(
          'Mất mạng, vui lòng kiểm tra lại kết nối internet'
        );
      } else if (idL) {
        this.helper.closeMessage(idL);
      }
    });
  }
  openChat(): void {
    const drawerRef = this.drawerService.create<ChatSideComponent>({
      nzContent: ChatSideComponent,
      nzWidth: this.helper.isMobileScreen ? '80%' : '20%',
      nzClosable: false,
    });
  }
  openSearch() {
    const drawerRef = this.drawerService.create<SearchSideComponent>({
      nzContent: SearchSideComponent,
      nzTitle: 'Tìm Kiếm',
      nzWidth: this.helper.isMobileScreen ? '80%' : '75%',
    });
  }
  signOut(): void {
    this.authSV.signOut();
  }
}
