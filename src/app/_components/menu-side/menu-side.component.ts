import { Component, OnInit } from '@angular/core';
import { FirestoreService } from 'src/app/_services/firestore.service';

@Component({
  selector: 'app-menu-side',
  templateUrl: './menu-side.component.html',
  styleUrls: ['./menu-side.component.scss'],
})
export class MenuSideComponent implements OnInit {
  menu = [
    // {
    //   title: 'Cá Nhân',
    //   icon: 'user',
    //   items: [
    //     {
    //       title: 'TRANG CHỦ',
    //       link: '/home',
    //     },
    //     {
    //       title: 'HƯỚNG DẪN',
    //       link: '/guide',
    //     },
    //     {
    //       title: 'CÀI ĐẶT',
    //       link: '/settings',
    //     },
    //   ],
    // },

    {
      title: 'Quản Lý Shop',
      icon: 'shop',
      items: [
        {
          title: 'ĐƠN HÀNG',
          link: 'shop/my-orders',
        },
        {
          title: 'ĐỐI SOÁT',
          link: '/shop/check-payment',
        },
        {
          title: 'PHIẾU THU',
          link: '/shop/receipt-list',
        },
      ],
    },
    {
      title: 'Quản Lý Kho',
      icon: 'appstore',
      items: [
        {
          title: 'ĐƠN MỚI',
          link: '/my-orders',
          queryParams: {
            type: 'stock',
            status: 'new',
          },
        },
        {
          title: 'ĐÃ ĐÓNG GÓI',
          link: '/my-orders',
          queryParams: {
            type: 'stock',
            status: 'packed',
          },
        },
        {
          title: 'ĐƠN HOÀN',
          link: '/stock/return-orders-list',
        },
        {
          title: 'PHIẾU XUẤT',
          link: '/stock/exports-list',
          badge: 3,
        },
        {
          title: 'NHÂN SỰ',
          link: '/stock/membership',
        },
        {
          title: 'SẢN PHẨM',
          link: '/stock/product-list',
        },
      ],
    },
  ];
  constructor(private fsSV: FirestoreService) {}

  ngOnInit(): void {
    this.fsSV.subExportLength().subscribe((l) => {
      this.menu[1].items[3].badge = l.length;
    });
  }
}
