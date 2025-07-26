import { AfterViewInit, Component, OnDestroy, TemplateRef, ViewChild } from '@angular/core';
import { NotificationComponent } from '../../../common/components/notification/notification.component';
import { ApiService } from '../../../common/services/api.service';
import { SideMenuService } from '../../../common/services/side-menu.service';
import { ContentSpinnerComponent } from "../../../common/components/content-spinner/content-spinner.component";
import { CommonModule } from '@angular/common';
import { PanelLayoutComponent } from "../../../common/components/panel-layout/panel-layout.component";
import { FlexibleTableDesktopComponent } from "../../../common/components/flexible-table/table-desktop/flexible-table-desktop.component";
import { CellFlag, CellLabel } from '../../../common/services/flexible-table.service';
import { MonacoEditorComponent } from '../../../common/components/monaco-editor/monaco-editor.component';
import { ResizablePanelsComponent } from '../../../common/components/resizable-panels/resizable-panels.component';
import { LocalTabsComponent } from '../../../common/components/local-tabs/local-tabs.component';
import { FlexibleTableDesktopVScrollComponent } from "../../../common/components/flexible-table/table-desktop-vscroll/flexible-table-desktop-vscroll.component";
import { ContentsSectionComponent } from "../../../common/components/sidemenu-items/contents-section/contents-section.component";

export interface ColumnData {
  columnName:string,
  dataType:string,
  notNull:boolean,
  defaultValue:string,
  primaryKey:boolean
}

@Component({
  selector: 'app-tools-page4',
  imports: [CommonModule, ContentSpinnerComponent, NotificationComponent, PanelLayoutComponent, FlexibleTableDesktopComponent, MonacoEditorComponent, ResizablePanelsComponent, LocalTabsComponent, FlexibleTableDesktopVScrollComponent, ContentsSectionComponent],
  templateUrl: './tools-page4.component.html'
})
export class ToolsPage4Component implements AfterViewInit, OnDestroy {
  @ViewChild("editor") editor!:MonacoEditorComponent;
  @ViewChild('sideMenuContent') sideMenuContent!: TemplateRef<any>;
  @ViewChild("notice") noticeComponent!: NotificationComponent;
  tableList:{[key:string]:ColumnData[]} = {};
  tableNames:string[] = [];

  tableListLabels:any = {};
  tableListStyles:any = {};
  isLoading:boolean = true;
  isExecute:boolean = false;

  queryLogs?:string = "";
  selectResult?:[{[key:string]:any}[]] = undefined;
  editorValue:string = "";

  constructor(
    private sideMenuService: SideMenuService,
    public apiService:ApiService
  ) {
    this.tableListLabels = {
      'columnName': CellLabel('カラム名'),
      'dataType': CellLabel('型名'),
      'notNull': CellFlag('NN'),
      'defaultValue': CellLabel('Default'),
      'primaryKey': CellFlag('PK'),
    };
    this.tableListStyles = {
      'columnName': {rowClass: "px-1"},
      'dataType': {rowClass: "px-1"},
      'notNull': {rowClass: "px-1"},
      'defaultValue': {rowClass: "px-1"},
      'primaryKey': {rowClass: "px-1"},
    };
  }

  // ビューの初期化後にテンプレートをサービスにセットする
  ngAfterViewInit(): void {
    this.sideMenuService.setContent(this.sideMenuContent);
    // テーブルリスト取得
    this.apiService.getTablesAndLogs().subscribe(
      (response) => {
        if (response.code === 200) {
          this.tableList = this.transformData(response.data);
          this.queryLogs = response.logs.join("\n");
        } else {
          this.noticeComponent.setNoticeError(response.code, response.error);
        }
        this.isLoading = false;
      }
    );
  }

  // コンポーネントが破棄される時にテンプレートをクリアする
  ngOnDestroy(): void {
    this.sideMenuService.clearContent();
  }

  transformData(response:[{[key:string]:any}]) {
    var result:{[key:string]:ColumnData[]} = {};
    this.tableNames = Array.from(new Set(response.map((data) => data["table_name"])));

    for (let tableName of this.tableNames) {
      var columnList:ColumnData[] = [];
      response.filter((data) => data['table_name'] === tableName).forEach((column) => {
        columnList.push({
          columnName: column['column_name'],
          dataType: column['data_type'],
          notNull: column['not_null'],
          defaultValue: column['default_value'] === "DATETIME('now', 'localtime')" ? "now()" : column['default_value'],
          primaryKey: column['primary_key']
        });
      });
      result[tableName] = columnList;
    }

    return result;
  }

  setQuery(str:string) {
    this.editorValue = str;
  }

  clearQuery() {
    this.setQuery("");
  }

  onEditorValueChange(value: string) {
    this.editorValue = value;
  }

  clearLog() {
    this.queryLogs = "";
    // ログ削除
    this.apiService.refleshQueryLogs().subscribe(
      (response) => {
        if (response.code !== 200) {
          this.queryLogs = `[code:${response.code}] ${response.error}`
        }
      }
    );
  }

  execute() {
    const query = this.editorValue;
    if (!query.trim()) {
      return;
    }
    
    this.isExecute = true;
    this.apiService.executeQuery(query).subscribe(
      (response) => {
        if (response.logs && response.logs.length > 0) {
          this.queryLogs += (this.queryLogs ? '\n' : '') + response.logs.join('\n');
        }
        if (response.result && response.result.length > 0) {
          // SELECT結果が返された場合
          this.selectResult = this.transformResult(response.result);
        } else {
          // INSERT/UPDATE/DELETE等の場合
          this.selectResult = undefined;
        }
        this.isExecute = false;
      },
      (error) => {
        this.isExecute = false;
        this.queryLogs += (this.queryLogs ? '\n' : '') + `[code:${error.status || 500}] ${error.error?.error || "クエリ実行エラーが発生しました"}`;
      }
    );
  }

  transformResult(tableDatas: [{[key: string]: any}[]]) {
    for (const datas of tableDatas) {
      datas.forEach((data, index) => {datas[index] = { '#': index + 1, ...data }; });
    }
    return tableDatas;
  }

  getSQLBySelectTable(tableName: string) {
    this.setQuery(`SELECT * FROM ${tableName} limit 100;`);
  }
}