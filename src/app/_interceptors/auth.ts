import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpResponse,
  HttpErrorResponse,
} from '@angular/common/http';
import { from, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { HelperService } from '../_services/helper.service';
import { AuthService } from '../_services/auth.service';
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private helper: HelperService, private authSV: AuthService) {}

  // tslint:disable-next-line: typedef
  intercept(req: HttpRequest<any>, next: HttpHandler) {
    // convert promise to observable using 'from' operator
    return from(this.handle(req, next));
  }

  // tslint:disable-next-line: typedef
  async handle(req: HttpRequest<any>, next: HttpHandler) {
    console.log(req.url);
    if (req.url !== '') {
      const idL = this.helper.loadingMessage('Đang truy vấn, vui lòng đợi...');
      // if your getAuthToken() function declared as "async getAuthToken() {}"
      const token = await this.authSV.getToken();

      // if your getAuthToken() function declared to return an observable then you can use
      // await this.auth.getAuthToken().toPromise()

      const newReq = req.clone({
        headers: req.headers.set('Authorization', 'Bearer ' + token),
      });
      // Important: Note the .toPromise()
      return next
        .handle(newReq)
        .pipe(
          catchError((error: HttpErrorResponse) => {
            console.log(error);
            if (error.status === 403) {
              this.helper.createMessage('Bạn không có quyền truy cập', 'error');
            } else {
              this.helper.createMessage('Có lỗi xảy ra', 'error');
            }
            return throwError(error);
          }),
          map((event: HttpEvent<any>) => {
            if (event instanceof HttpResponse) {
              const { code, data } = event.body;
              this.helper.closeMessage(idL);
              if (code === 'error') {
                this.helper.createMessage(data, 'error');
                throwError(data);
              } else {
                return event;
              }
            }
          })
        )
        .toPromise();
    }
  }
}
