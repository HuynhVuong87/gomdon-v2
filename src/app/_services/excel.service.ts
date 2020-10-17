import { Injectable } from '@angular/core';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
import { DialogEditColExcelComponent } from '../_dialogs/dialog-edit-col-excel/dialog-edit-col-excel.component';
import { HelperService } from './helper.service';
import { DialogsService } from './dialogs.service';
const EXCEL_TYPE =
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';
@Injectable({
  providedIn: 'root',
})
export class ExcelService {
  constructor(
    private helper: HelperService,
    private dialogSV: DialogsService
  ) {}
  public async exportAsExcelFile(json: any[], excelFileName: string) {
    const res = await this.dialogSV.openDialog(
      DialogEditColExcelComponent,
      'Cấu Hình Cột Trước Khi Xuất Ra Excel',
      Object.keys(json[0]).map((x) => {
        return {
          name: x,
          active: true,
        };
      })
    );
    if (res) {
      const data = [];
      json.forEach((val) => {
        const item = {};

        res.forEach((element) => {
          item[element] = val[element];
        });
        if (item !== {}) {
          item['TẠO NGÀY'] = this.helper.milisecToDate(
            +item['TẠO NGÀY'] * 1000,
            'dd/MM/y'
          );
          data.push(item);
        }
      });
      if (data.length > 0) {
        const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
        const workbook: XLSX.WorkBook = {
          Sheets: { data: worksheet },
          SheetNames: ['data'],
        };
        const excelBuffer: any = XLSX.write(workbook, {
          bookType: 'xlsx',
          type: 'array',
        });
        this.saveAsExcelFile(excelBuffer, excelFileName);
      }
    }
  }

  private saveAsExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], { type: EXCEL_TYPE });
    FileSaver.saveAs(
      data,
      fileName +
        '-' +
        this.helper.milisecToDate(null, 'HH:mm dd/MM/y') +
        EXCEL_EXTENSION
    );
  }
  async readFilePayment(fileInput: File, headers?: string[]) {
    let workBook = null;
    let jsonData = null;
    let dataJSON = [];
    const reader = new FileReader();
    const file = fileInput;
    return await new Promise((r) => {
      reader.onload = (event) => {
        const data = reader.result;
        workBook = XLSX.read(data, { type: 'binary' });
        jsonData = workBook.SheetNames.reduce((initial, name) => {
          const sheet = workBook.Sheets[name];
          initial[name] = XLSX.utils.sheet_to_json(sheet, {
            header: headers ? headers : 1,
            raw: false,
          });
          return initial;
        }, {});
        dataJSON = jsonData[Object.keys(jsonData)[0]];
        if (dataJSON.length === 0) {
          r([]);
        } else {
          let index = 0;
          let checkHeader = false;
          for (const item of dataJSON) {
            let check = 0;
            index++;
            Object.keys(item).forEach((key) => {
              key.toLowerCase() === item[key].toString().toLowerCase()
                ? check++
                : // tslint:disable-next-line: no-unused-expression
                  '';
            });
            if (check === Object.keys(item).length) {
              dataJSON = dataJSON.slice(index);
              dataJSON.map((x, i) => {
                x.index = i;
                return x;
              });
              checkHeader = true;
              r(dataJSON);
              break;
            }
          }
          if (!checkHeader) {
            this.helper.createMessage(
              'Vui lòng kiểm tra lại tên cột trong file excel của bạn',
              'error'
            );
            r([]);
          }
        }
      };
      reader.readAsBinaryString(file);
    });
  }
}
