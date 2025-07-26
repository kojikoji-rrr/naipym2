import { CommonModule } from "@angular/common";
import { Component, AfterViewInit, OnDestroy, ViewChild, TemplateRef, ElementRef } from "@angular/core";
import { ApiService } from "../common/services/api.service";
import { SideMenuService } from "../common/services/side-menu.service";
import { PageHeaderComponent } from "../common/components/page-header/page-header.component";
import { FileUploadContainerComponent } from "../common/components/fileupload-container/fileupload-container.component";
import { NotificationComponent } from "../common/components/notification/notification.component";
import { ContentSpinnerComponent } from "../common/components/content-spinner/content-spinner.component";
import { FlexibleTableColumn } from "../common/components/flexible-table/table-base/flexible-table-base.component";
import { FlexibleTableDesktopColumn, FlexibleTableDesktopComponent } from "../common/components/flexible-table/table-desktop/flexible-table-desktop.component";
import { CellLabel, CellDelBtn } from "../common/services/flexible-table.service";
import { DateFormatPipe } from "../common/pipes/date-format/date-format.pipe";
import { FileSizePipe } from "../common/pipes/file-size/file-size.pipe";
import { ScheduledExcecComponent } from "../common/components/scheduled-exec/scheduled-exec.component";
import { NoticeService } from "../common/services/notice.service";
import { firstValueFrom, lastValueFrom } from "rxjs";
import { MonacoEditorComponent } from "../common/components/monaco-editor/monaco-editor.component";
import { JobInfoComponent } from "../common/components/job-info/job-info.component";

export interface BatchExecInfo {
  job_id: string,
  argument: {[key:string]:any},
  message?: string,
  status?: string,
  started_at?: string,
  stopped_at?: string,
  logs: string[],
  lastline: number,
}

@Component({
  selector: 'app-batch',
  imports: [CommonModule, PageHeaderComponent, FileUploadContainerComponent, NotificationComponent, ContentSpinnerComponent, FlexibleTableDesktopComponent, ScheduledExcecComponent, JobInfoComponent],
  templateUrl: './batch.component.html'
})
export class BatchComponent implements AfterViewInit, OnDestroy{
  @ViewChild('sideMenuContent') sideMenuContent!: TemplateRef<any>;
  @ViewChild('bookmarkUpload') bookmarkUpload!: FileUploadContainerComponent;
  @ViewChild('uploadNotice') uploadNotice!:NotificationComponent;
  @ViewChild('listNotice') listNotice!:NotificationComponent;
  @ViewChild('initializeBatchNotice') initializeBatchNotice!:NotificationComponent;
  isUploadingBookmarkUpload: boolean = false;
  isLoadingBookmarkUpload: boolean = false;
  isDeletingBookmarkUpload: boolean = false;
  bookmarkList:{[key:string]: any}[] = [];
  bookmarkListLabels: {[key:string]: FlexibleTableColumn} = {};
  bookmarkListStyles: {[key:string]: FlexibleTableDesktopColumn}
  bookmarkListMusts:any = [];
  initializeBatch:boolean = false;
  batchExecInfo:{[key:string]:BatchExecInfo|undefined} = {}

  constructor(
    private sideMenuService: SideMenuService,
    private noticeService:NoticeService,
    private apiService:ApiService
  ) {
    this.bookmarkListLabels = {
      "created_at": CellLabel("アップロード日時"),
      "updated_at": CellLabel("最終更新日時"),
      "filename"  : CellLabel("ファイル名"),
      "size"      : CellLabel("サイズ"),
      "delbtn"    : CellDelBtn("削除", {onClick: (data, component) => this.deleteBookmark(data['row']['filename'])})
    };
    this.bookmarkListStyles = {
      "created_at": {width: "120px", colClass: "text-xs", rowClass : "text-xs px-2"},
      "updated_at": {width: "120px", colClass: "text-xs", rowClass : "text-xs px-2"},
      "filename"  : {colClass: "text-xs", rowClass : "text-xs px-2"},
      "size"      : {colClass: "text-xs", rowClass : "text-xs px-2"},
      "delbtn"    : {width: "50px", colClass: "text-xs", rowClass : "text-xs"},
    };
    this.bookmarkListMusts = ["delbtn"];

    this.getBookmarkList();
    this.initializeBatchInfo();
  }

  ngAfterViewInit() {
    this.sideMenuService.setContent(this.sideMenuContent);
  }

  ngOnDestroy() {
    this.sideMenuService.clearContent();
  }

  getBookmarkList() {
    this.isLoadingBookmarkUpload = true;
    this.apiService.getBookmarkFile().subscribe(
      (response) => {
        this.bookmarkList = this.transformBookmarkListData(response);
        this.isLoadingBookmarkUpload = false;
      },(error) => {
        this.listNotice.setNoticeError(error.status_code, error.message);
        this.isLoadingBookmarkUpload = false;
      }
    );
  }

  uploadBookmark(file:File) {
    if (!file) return;
    this.isUploadingBookmarkUpload = true;
    this.uploadNotice.clear();
    this.apiService.uploadBookmarkFile(file).subscribe(
      (res: any) => {
        if (res.code === 200) {
          this.getBookmarkList();
          this.bookmarkUpload.clear();
        } else {
          this.uploadNotice.setNoticeError(res.code, res.error);
        }
        this.isUploadingBookmarkUpload = false;
      },(error) => {
        this.uploadNotice.setNoticeError(error.status_code, error.message);
        this.isUploadingBookmarkUpload = false;
      }
    );
  }

  deleteBookmark(filename:string) {  
    this.isDeletingBookmarkUpload = true;
    this.listNotice.clear();
    this.apiService.deleteBookmarkFile(filename).subscribe(
      (res)=>{
        if (res.code === 200) {
          this.bookmarkList = this.bookmarkList.filter(item => item["filename"] !== filename);
        } else {
          this.listNotice.setNoticeError(res.code, res.error);
        }
        this.isDeletingBookmarkUpload = false;
      },(error) => {
        this.listNotice.setNoticeError(error.status_code, error.message);
        this.isDeletingBookmarkUpload = false;
      }
    );
  }

  transformBookmarkListData(response:[{[key:string]:any}]) {
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

  initializeBatchInfo() {
    this.initializeBatch = true;
    this.apiService.getBatchInfoAll().subscribe(
      (response) => {
        if (response.code === 200) {
          this.batchExecInfo = response.result;
        } else {
          this.initializeBatchNotice.setNoticeError(response.code, response.error);
        }
        this.initializeBatch = false;
      },(error) => {
        this.initializeBatchNotice.setNoticeError(error.status_code, error.message);
        this.initializeBatch = false;
      }
    );
  }

  getBatchInfo(key:string) {
    this.apiService.getBatchInfo(this.batchExecInfo[key]!.job_id, this.batchExecInfo[key]!.lastline).subscribe(
      (response) => {
        if(response.code === 200) {
          this.batchExecInfo[key]!.status = response.result.status;
          this.batchExecInfo[key]!.message = response.result.message;
          this.batchExecInfo[key]!.stopped_at = response.result.stopped_at;
          this.batchExecInfo[key]!.lastline = response.result.lastline;
          this.batchExecInfo[key]!.logs.push(...response.result.logs);
        } else {
          this.noticeService.setNoticeError(response.code, response.error);
        }
      },(error) => {
        this.noticeService.setNoticeError(error.status_code, error.message);
      }
    );
  }

  async executeBatch(key:string) {
    this.initializeBatch = true;
    try {
      const response = await lastValueFrom(this.apiService.executeBatch(key));
      if (response.code === 200) {
        this.batchExecInfo[key] = response.result;
      } else {
        this.noticeService.setNoticeError(response.code, response.error);
      }
    } catch (error: any) {
      this.noticeService.setNoticeError(error.status, error.message);
    }
    this.initializeBatch = false;
  }

  isExecute(key:string) {
    return this.batchExecInfo[key]?.status === 'running' || false;
  }
}
