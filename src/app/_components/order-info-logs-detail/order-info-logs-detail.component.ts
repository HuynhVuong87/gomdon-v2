import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { GomdonLogs } from 'src/app/openapi';
import { ILogsDetail } from 'src/app/_pages/my-orders/order-detail/order-detail.component';

@Component({
  selector: 'app-order-info-logs-detail',
  templateUrl: './order-info-logs-detail.component.html',
  styleUrls: ['./order-info-logs-detail.component.scss'],
})
export class OrderInfoLogsDetailComponent {
  @Input() logs: ILogsDetail[];
  constructor() {}
}
