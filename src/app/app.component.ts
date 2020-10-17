import { Component, NgZone, HostListener, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AuthService } from './_services/auth.service';
import { HelperService } from './_services/helper.service';
import { UserService } from './openapi';
import { EsSearchService } from './_services/es-search.service';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  isCollapsed = false;
  needLogin: boolean;
  mobile = false;
  visibleMBSide = false;
  ready: boolean;
  constructor(
    afu: AngularFireAuth,
    authSV: AuthService,
    ngZone: NgZone,
    private helper: HelperService,
    userSV: UserService,
    private ES: EsSearchService
  ) {
    this.getScreenSize();
    setTimeout(() => {
      this.ready = true;
    }, 2000);
    afu.onAuthStateChanged(async (u) => {
      ngZone.run(async () => {
        if (u !== null) {
          const { email, displayName, uid, photoURL } = u;
          // get claims
          const claims = (await u.getIdTokenResult(true)).claims;

          if (claims.quanlykho === undefined) {
            await new Promise((r) => {
              u.getIdToken(true).then((token) => {
                userSV.configuration.accessToken = token;
                userSV
                  .createUser({
                    displayName: u.displayName,
                    email: claims.email,
                    photoURL: claims.picture,
                    uid: u.uid,
                  })
                  .subscribe(
                    async () => {
                      r();
                    },
                    (err) => {
                      console.log(err);
                    }
                  );
              });
            });
          }
          authSV.setInfo({
            email,
            displayName,
            uid,
            photoURL,
            role: (await u.getIdTokenResult(true)).claims.role || null,
          });
          console.log(authSV.getInfo());
          this.needLogin = false;
        } else {
          authSV.setInfo(null);
          this.needLogin = true;
        }
      });
    });
  }

  async ngOnInit() {
    // console.log(brands.length);

    // await this.helper.asyncForEach(
    //   brands,
    //   async (b: { id: number; n: string }, i: number) => {
    //     if (i >= 12000) {
    //       await this.ES.setIndexDoc(
    //         'lazada_brands',
    //         {
    //           id: b.id.toString(),
    //           brand_name: b.n,
    //         },
    //         i.toString()
    //       ).catch((err) => console.log(err));
    //       console.log(i + 1, b.id);
    //     }
    //   }
    // );
    console.log('done');
  }
  collapsedF(e: boolean): void {
    console.log(e);
  }
  @HostListener('window:resize', ['$event'])
  getScreenSize(): void {
    this.mobile = window.innerWidth > 800 ? false : true;
    this.helper.isMobileScreen = this.mobile;
  }
}
