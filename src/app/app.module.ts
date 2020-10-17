import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { IconsProviderModule } from './icons-provider.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { registerLocaleData, DatePipe, DecimalPipe } from '@angular/common';
import vi from '@angular/common/locales/vi';
import { NgZorroAntdModule, NZ_I18N, vi_VN } from 'ng-zorro-antd';
import { NzAffixModule } from 'ng-zorro-antd/affix';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { NzLayoutModule, NzSiderComponent } from 'ng-zorro-antd/layout';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { NgxPrintModule } from 'ngx-print';
import { NgxBarcodeModule } from 'ngx-barcode';

// angularfire
import { AngularFireModule } from '@angular/fire';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { AngularFireAuthGuard } from '@angular/fire/auth-guard';

import { AuthInterceptor } from './_interceptors/auth';

import { CustomStringPipe } from './_pipes/custom-string.pipe';

import { HomeComponent } from './_pages/home/home.component';
import { HeaderComponent } from './_components/header/header.component';
import { MenuSideComponent } from './_components/menu-side/menu-side.component';
import { environment } from 'src/environments/environment';
import { LoginComponent } from './_pages/auth/login/login.component';
import { MyOrdersComponent } from './_pages/my-orders/my-orders.component';
import { SearchBarComponent } from './_components/search-bar/search-bar.component';
import { ActionButtonComponent } from './_components/action-button/action-button.component';
import { OrderDetailComponent } from './_pages/my-orders/order-detail/order-detail.component';
import { OrderInfoCustomerComponent } from './_components/order-info-customer/order-info-customer.component';
import { OrderInfoPaidComponent } from './_components/order-info-paid/order-info-paid.component';
import { OrderInfoItemsComponent } from './_components/order-info-items/order-info-items.component';
import { ApiModule, Configuration, ConfigurationParameters } from './openapi';
import { OrderInfoLogsDetailComponent } from './_components/order-info-logs-detail/order-info-logs-detail.component';
import { DialogSetPickComponent } from './_dialogs/dialog-set-pick/dialog-set-pick.component';
import { MembershipComponent } from './_pages/stock/membership/membership.component';
import { DialogEditColExcelComponent } from './_dialogs/dialog-edit-col-excel/dialog-edit-col-excel.component';
import { PrintComponent } from './_components/print/print.component';
import { PrintOrdersBarcodeComponent } from './_components/print/print-orders-barcode/print-orders-barcode.component';
import { PrintExportComponent } from './_components/print/print-export/print-export.component';
import { ExportsListComponent } from './_pages/stock/exports-list/exports-list.component';
import { ExportDetailComponent } from './_pages/stock/export-detail/export-detail.component';
import { ReturnOrdersListComponent } from './_pages/stock/return-orders-list/return-orders-list.component';
import { DialogScanReturnOrdersComponent } from './_dialogs/dialog-scan-return-orders/dialog-scan-return-orders.component';
import { PrintReturnOrdersComponent } from './_components/print/print-return-orders/print-return-orders.component';
import { CheckPaymentComponent } from './_pages/shop/check-payment/check-payment.component';
import { ReceiptListComponent } from './_pages/shop/receipt-list/receipt-list.component';
import { ReceiptDetailComponent } from './_pages/shop/receipt-detail/receipt-detail.component';
import { DialogChangeStockComponent } from './_dialogs/dialog-change-stock/dialog-change-stock.component';
import { ChatSideComponent } from './_components/chat-side/chat-side.component';
import { SearchSideComponent } from './_components/search-side/search-side.component';
import { PrintOrdersQrcodeComponent } from './_components/print/print-orders-qrcode/print-orders-qrcode.component';
import { ProductListComponent } from './_pages/stock/product-list/product-list.component';
import { ProductDetailComponent } from './_pages/stock/product-detail/product-detail.component';
import { ProductFormGeneralComponent } from './_components/product-form/product-form-general/product-form-general.component';
import { ProductFormSellInfoComponent } from './_components/product-form/product-form-sell-info/product-form-sell-info.component';
import { ProductFormImagesComponent } from './_components/product-form/product-form-images/product-form-images.component';
import { ProductFormCarrierComponent } from './_components/product-form/product-form-carrier/product-form-carrier.component';
import { ProductFormOtherComponent } from './_components/product-form/product-form-other/product-form-other.component';

registerLocaleData(vi);
export function apiConfigFactory(): Configuration {
  // tslint:disable-next-line: prefer-const
  // AuthService.getToken().then(token => {
  //   console.log(token);
  // });
  const params: ConfigurationParameters = {
    // set configuration parameters here.
    // basePath: 'http://localhost:8080',
    basePath: 'https://us-central1-ctvbanhang-a398d.cloudfunctions.net/api',
  };
  return new Configuration(params);
}

@NgModule({
  declarations: [
    AppComponent,
    CustomStringPipe,
    HomeComponent,
    HeaderComponent,
    MenuSideComponent,
    LoginComponent,
    MyOrdersComponent,
    SearchBarComponent,
    ActionButtonComponent,
    OrderDetailComponent,
    OrderInfoCustomerComponent,
    OrderInfoPaidComponent,
    OrderInfoItemsComponent,
    OrderInfoLogsDetailComponent,
    DialogSetPickComponent,
    MembershipComponent,
    DialogEditColExcelComponent,
    PrintComponent,
    PrintOrdersBarcodeComponent,
    PrintExportComponent,
    ExportsListComponent,
    ExportDetailComponent,
    ReturnOrdersListComponent,
    DialogScanReturnOrdersComponent,
    PrintReturnOrdersComponent,
    CheckPaymentComponent,
    ReceiptListComponent,
    ReceiptDetailComponent,
    DialogChangeStockComponent,
    ChatSideComponent,
    SearchSideComponent,
    PrintOrdersQrcodeComponent,
    ProductListComponent,
    ProductDetailComponent,
    ProductFormGeneralComponent,
    ProductFormSellInfoComponent,
    ProductFormImagesComponent,
    ProductFormCarrierComponent,
    ProductFormOtherComponent,
  ],
  imports: [
    NzAffixModule,
    NgxBarcodeModule,
    NgxPrintModule,
    DragDropModule,
    NgxDatatableModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserModule,
    AppRoutingModule,
    NgZorroAntdModule,
    IconsProviderModule,
    HttpClientModule,
    BrowserAnimationsModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireAuthModule,
    NzLayoutModule,
    ApiModule.forRoot(apiConfigFactory),
  ],
  providers: [
    NzSiderComponent,
    AngularFireAuthGuard,
    DatePipe,
    DecimalPipe,
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    { provide: NZ_I18N, useValue: vi_VN },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
