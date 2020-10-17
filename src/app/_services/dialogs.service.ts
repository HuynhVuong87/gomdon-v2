import { Injectable, TemplateRef, Component, Type } from '@angular/core';
import { NzModalService } from 'ng-zorro-antd';

@Injectable({
  providedIn: 'root',
})
export class DialogsService {
  constructor(private modalService: NzModalService) {}

  async openDialog(
    cpn: string | TemplateRef<any> | Type<unknown>,
    title: string,
    data: any
  ): Promise<any> {
    return await new Promise((r) => {
      const modal = this.modalService.create({
        nzTitle: title,
        nzContent: cpn,
        nzMaskClosable: false,
        nzAutofocus: null,
        nzFooter: null,
        nzWidth: 'fit-content',
        nzClassName: 'my-dialog',
        nzComponentParams: {
          data,
        },
      });
      modal.afterClose.subscribe((res) => {
        r(res);
      });
    });
  }
}
