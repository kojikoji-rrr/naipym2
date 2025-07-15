import { CommonModule } from '@angular/common';
import { AfterViewInit, Component } from '@angular/core';
import { FlexibleTableDesktopColumn, FlexibleTableDesktopComponent } from '../../../common/components/flexible-table/table-desktop/flexible-table-desktop.component';
import { ContentSpinnerComponent } from '../../../common/components/content-spinner/content-spinner.component';
import { ApiService } from '../../../common/services/api.service';
import { CellDelBtn, CellLabel } from '../../../common/services/flexible-table.service';
import { DateFormatPipe } from '../../../common/pipes/date-format/date-format.pipe';
import { FileSizePipe } from '../../../common/pipes/file-size/file-size.pipe';
import { FlexibleTableColumn } from '../../../common/components/flexible-table/table-base/flexible-table-base.component';
import { SpinnerComponent } from '../../../common/components/spinner/spinner.component';

@Component({
  selector: 'app-tools-page5',
  imports: [CommonModule, SpinnerComponent, ContentSpinnerComponent, FlexibleTableDesktopComponent],
  templateUrl: './tools-page5.component.html'
})
export class ToolsPage5Component implements AfterViewInit{
  isExecute:boolean = false;
  isLoading:boolean = true;
  data:{[key:string]: any}[] = [];
  labels: {[key:string]: FlexibleTableColumn} = {};
  styles: {[key:string]: FlexibleTableDesktopColumn}
  musts:any = [];
  result:any = undefined;

  constructor(private apiService:ApiService) {
    this.labels = {
      "created_at": CellLabel("バックアップ日時"),
      "updated_at": CellLabel("最終更新日時"),
      "filename"  : CellLabel("ファイル名"),
      "size"      : CellLabel("サイズ"),
      "delbtn"    : CellDelBtn("削除", {onClick: (data, component) => this.delete(data['row']['filename'])})
    };
    this.styles = {
      "created_at": {width: "120px", colClass: "text-xs", rowClass : "text-xs px-2"},
      "updated_at": {width: "120px", colClass: "text-xs", rowClass : "text-xs px-2"},
      "filename"  : {colClass: "text-xs", rowClass : "text-xs px-2"},
      "size"      : {colClass: "text-xs", rowClass : "text-xs px-2"},
      "delbtn"    : {width: "50px", colClass: "text-xs", rowClass : "text-xs"},
    };
    this.musts = ["delbtn"];
  }
  
  ngAfterViewInit(): void {
    this.apiService.getDBBackupList().subscribe(
      (response) => {
        this.data = this.transformData(response);
        this.isLoading = false;
      }
    );
  }

  transformData(response:[{[key:string]:any}]) {
    const fileSizePipe = new FileSizePipe();
    const dateFormatPipe = new DateFormatPipe();

    return response.map((item, index) => {
      const processedItem = { ...item };
      processedItem["created_at"] = dateFormatPipe.transform(item["created_at"]).replace(" ", "<br>");
      processedItem["updated_at"] = dateFormatPipe.transform(item["updated_at"]).replace(" ", "<br>");
      processedItem["size"] = fileSizePipe.transform(item["size"]);
      return processedItem;
    });
  }

  execute() {
    this.isExecute = true;
    this.result = undefined;

    this.apiService.createDBBackup().subscribe(
      (res)=>{
        if (res.code === 200) {
          this.transformData([res.fileinfo]).forEach(item => this.data.push(item));
        } else {
          this.result = res;
        }
        this.isExecute = false;
      }
    );
  }

  delete(filename:string) {  
    this.isExecute = true;
    this.result = undefined;

    this.apiService.deleteDBBackup(filename).subscribe(
      (res)=>{
        if (res.code === 200) {
          this.data = this.data.filter(item => item["filename"] !== filename);
        } else {
          this.result = res;
        }
        this.isExecute = false;
      }
    );
  }
}