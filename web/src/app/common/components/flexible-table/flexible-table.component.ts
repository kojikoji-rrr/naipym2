import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, Injector } from '@angular/core';
import { SafeHtml, DomSanitizer } from '@angular/platform-browser';

// 列定義
export interface FlexibleTableColumn {
  // ヘッダ名
  label: string;
  // ヘッダclass
  colClass?: string;
  // class
  rowClass?: string;
  // style
  rowStyle?: {[key:string]: string};
  // データ表示コンポーネント
  rowComponent?: any;
  // 列幅
  width?: string;
}

@Component({
  selector: 'app-flexible-table',
  imports: [CommonModule],
  templateUrl: 'flexible-table.component.html'
})
export class FlexibleTableComponent {
  // 表示データ
  @Input() data: Array<{[key:string]: any}> = [];
  // ヘッダラベル
  @Input() thLabels: {[key:string]: FlexibleTableColumn} = {}
  // 非表示カラム
  @Input() hideColumns: Array<string> = [];
  // ソートイベント（未設定の場合デフォルト処理）
  @Output() sortEvent = new EventEmitter<{sortColumn: {[key:string]: boolean}, data: Array<{[key:string]: any}>}>();
  // ソート処理
  sortColumn: {[key:string]: boolean} = {}

  constructor(
    public injector: Injector,
    private sanitizer: DomSanitizer
  ) {}

  // 表示対象のカラムキーを取得
  getVisibleColumns(): string[] {
    if (this.data.length === 0) return [];
    
    // thLabelsが空でない場合は、thLabelsのキーの順序で表示
    if (Object.keys(this.thLabels).length > 0) {
      return Object.keys(this.thLabels).filter(key => !this.hideColumns.includes(key));
    }
    
    // thLabelsが空の場合は従来通り（データのキー全てから hideColumns を除外）
    const allKeys = Object.keys(this.data[0]);
    return allKeys.filter(key => !this.hideColumns.includes(key));
  }

  // ソート処理
  onChangeSort(key: string) {
    // ソートキー追加
    if (!this.sortColumn.hasOwnProperty(key)) {
      this.sortColumn[key] = false;
    } else if (!this.sortColumn[key]) {
      this.sortColumn[key] = true;
    } else {
      delete this.sortColumn[key];
    }

    // ソート処理
    if (this.sortEvent.observers.length > 0) {
      // イベント設定済ならイベント発火
      // ※ 呼出元でソート後の結果をdataに再設定する可能性もあるのでソートはしない。
      this.sortEvent.emit({sortColumn: this.sortColumn, data: this.data});
    } else {
      // イベント未設定ならデフォルトのソート処理を実行
      this.defaultSort();
    }
  }

  private defaultSort() {
    // dataに対してsortColumnの優先順でソートを行う（trueなら昇順、falseなら降順）
    this.data.sort((a, b) => {
      for (const key in this.sortColumn) {
        if (this.sortColumn.hasOwnProperty(key)) {
          const order = this.sortColumn[key] ? 1 : -1;
          if (a[key] < b[key]) return -1 * order;
          if (a[key] > b[key]) return 1 * order;
        }
      }
      return 0;
    });
  }

  public createInjector(key:string, row:{[key:string]:any}): Injector {
    const data: any = {key:key, row:row};
    return Injector.create({
      providers: [{provide:'data', useValue: data}],
      parent: this.injector
    });
  }

  // HTML文字列を安全にサニタイズ
  public getSafeHtml(htmlString: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(htmlString);
  }

  setSortColumn(sortColumn: {[key:string]: boolean}) {
    this.sortColumn = sortColumn;
    // ソート処理
    if (this.sortEvent.observers.length > 0) {
      // イベント設定済ならイベント発火
      // ※ 呼出元でソート後の結果をdataに再設定する可能性もあるのでソートはしない。
      this.sortEvent.emit({sortColumn: this.sortColumn, data: this.data});
    } else {
      // イベント未設定ならデフォルトのソート処理を実行
      this.defaultSort();
    }
  }
}