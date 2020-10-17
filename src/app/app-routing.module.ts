import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './_pages/home/home.component';
import {
  hasCustomClaim,
  redirectUnauthorizedTo,
  redirectLoggedInTo,
  AngularFireAuthGuard,
} from '@angular/fire/auth-guard';
import { LoginComponent } from './_pages/auth/login/login.component';
import { MyOrdersComponent } from './_pages/my-orders/my-orders.component';
import { OrderDetailComponent } from './_pages/my-orders/order-detail/order-detail.component';
import { MembershipComponent } from './_pages/stock/membership/membership.component';
import { ExportsListComponent } from './_pages/stock/exports-list/exports-list.component';
import { ExportDetailComponent } from './_pages/stock/export-detail/export-detail.component';
import { ReturnOrdersListComponent } from './_pages/stock/return-orders-list/return-orders-list.component';
import { CheckPaymentComponent } from './_pages/shop/check-payment/check-payment.component';
import { ReceiptListComponent } from './_pages/shop/receipt-list/receipt-list.component';
import { ReceiptDetailComponent } from './_pages/shop/receipt-detail/receipt-detail.component';
import { ProductListComponent } from './_pages/stock/product-list/product-list.component';
import { ProductDetailComponent } from './_pages/stock/product-detail/product-detail.component';

const adminOnly = () => hasCustomClaim('admin');
const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(['login']);
// const redirectLoggedInToHome = () => redirectLoggedInTo(['home']);

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: '/home' },
  {
    path: 'home',
    component: HomeComponent,
    canActivate: [AngularFireAuthGuard],
    data: { authGuardPipe: redirectUnauthorizedToLogin },
  },
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [AngularFireAuthGuard],
    // data: { authGuardPipe: redirectLoggedInToHome },
  },
  {
    path: 'my-orders',
    component: MyOrdersComponent,
    canActivate: [AngularFireAuthGuard],
    data: { authGuardPipe: redirectUnauthorizedToLogin },
  },
  {
    path: 'order/:id',
    component: OrderDetailComponent,
    canActivate: [AngularFireAuthGuard],
    data: { authGuardPipe: redirectUnauthorizedToLogin },
  },
  {
    path: 'shop/my-orders',
    component: MyOrdersComponent,
    canActivate: [AngularFireAuthGuard],
    data: { authGuardPipe: redirectUnauthorizedToLogin },
  },
  {
    path: 'stock/membership',
    component: MembershipComponent,
    canActivate: [AngularFireAuthGuard],
    data: { authGuardPipe: redirectUnauthorizedToLogin },
  },
  {
    path: 'stock/exports-list',
    component: ExportsListComponent,
    canActivate: [AngularFireAuthGuard],
    data: { authGuardPipe: redirectUnauthorizedToLogin },
  },
  {
    path: 'stock/export/:id',
    component: ExportDetailComponent,
    canActivate: [AngularFireAuthGuard],
    data: { authGuardPipe: redirectUnauthorizedToLogin },
  },
  {
    path: 'stock/return-orders-list',
    component: ReturnOrdersListComponent,
    canActivate: [AngularFireAuthGuard],
    data: { authGuardPipe: redirectUnauthorizedToLogin },
  },
  {
    path: 'stock/product-list',
    component: ProductListComponent,
    canActivate: [AngularFireAuthGuard],
    data: { authGuardPipe: redirectUnauthorizedToLogin },
  },
  {
    path: 'stock/product/:id',
    component: ProductDetailComponent,
    canActivate: [AngularFireAuthGuard],
    data: { authGuardPipe: redirectUnauthorizedToLogin },
  },
  {
    path: 'shop/check-payment',
    component: CheckPaymentComponent,
    canActivate: [AngularFireAuthGuard],
    data: { authGuardPipe: redirectUnauthorizedToLogin },
  },
  {
    path: 'shop/receipt-list',
    component: ReceiptListComponent,
    canActivate: [AngularFireAuthGuard],
    data: { authGuardPipe: redirectUnauthorizedToLogin },
  },
  {
    path: 'shop/receipt/:id',
    component: ReceiptDetailComponent,
    canActivate: [AngularFireAuthGuard],
    data: { authGuardPipe: redirectUnauthorizedToLogin },
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
