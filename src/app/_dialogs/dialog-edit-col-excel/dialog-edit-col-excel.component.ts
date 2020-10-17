import { Component, OnInit } from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { NzModalRef } from 'ng-zorro-antd';

@Component({
  selector: 'app-dialog-edit-col-excel',
  templateUrl: './dialog-edit-col-excel.component.html',
  styleUrls: ['./dialog-edit-col-excel.component.scss'],
})
export class DialogEditColExcelComponent implements OnInit {
  data: any;
  constructor(private modal: NzModalRef) {}

  ngOnInit(): void {}

  destroyModal() {
    this.modal.close();
  }

  save() {
    this.modal.close(this.data.filter((x) => x.active).map((x) => x.name));
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.data, event.previousIndex, event.currentIndex);
  }
}
