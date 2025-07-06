import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, Injector, ViewChildren, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { SafeHtml, DomSanitizer } from '@angular/platform-browser';
import { isNumberObject } from 'util/types';

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
  // コンポーネントハンドラー（親コンポーネントのメソッド名を文字列で指定）
  handler?: { [key: string]: (data: any, component?: any) => void };
  // 列幅
  width?: string;
  // モバイル版設定
  mobile?: {
    // 小さい列として扱うか（中央揃え等）
    isSmall?: boolean;
    // モバイル版での最小幅
    minWidth?: string;
    // フレックス設定
    flex?: string;
    // 画像列として扱うか
    isImage?: boolean;
    // 画像なし時のテキスト
    emptyText?: string;
  };
}

// Injectorデータ定義
export interface InjectedData {
  key: string;
  row: { [key: string]: any };
  register: (instance: any) => void;
  unregister: () => void;
  parentComponent: any; // 親コンポーネントへの参照を追加
}

@Component({
  selector: 'app-flexible-table',
  imports: [CommonModule],
  templateUrl: 'flexible-table.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FlexibleTableComponent implements OnInit{
  // 表示データ
  @Input() data: Array<{[key:string]: any}> = [];
  // ヘッダラベル
  @Input() thLabels: {[key:string]: FlexibleTableColumn} = {}
  // 非表示カラム
  @Input() hideColumns: Array<string> = [];
  // キー項目
  @Input() trackByKeys: Array<string> = [];
  // ソート初期値
  @Input() sortedColumns: {[key:string]: boolean} = {}
  // 親コンポーネント参照
  @Input() parentComponent?: any;
  // 行の高さ（全体指定）
  @Input() rowHeight?: string;
  // ソートイベント（未設定の場合デフォルト処理）
  @Output() sortEvent = new EventEmitter<{data:Array<{[key:string]: any}>, sort:{[key:string]: boolean}}>();
  
  // ソート状態
  currentSort: {[key:string]: boolean} = {};
  // 列コンポーネント
  rowComponents = new Map<any, Map<string, any>>();

  constructor(
    public injector: Injector,
    private sanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
     this.currentSort = this.sortedColumns;
  }

  onChangeSort(key: string) {
    // ソートキー追加（新しいオブジェクトを作成）
    if (!this.currentSort.hasOwnProperty(key)) {
      this.currentSort[key] = false;
    } else if (!this.currentSort[key]) {
      this.currentSort[key] = true;
    } else {
      delete this.currentSort[key];
    }
    // ソート処理
    this.sort();
    this.cdr.markForCheck();
  }

  clearSort() {
    this.currentSort = {};
    this.sort();
    this.cdr.markForCheck(); 
  }

  sort() {
    if (this.sortEvent.observers.length > 0) {
      // イベント設定済ならイベント発火
      // ※ 呼出元でソート後の結果をdataに再設定する可能性もあるのでソートはしない。
      this.sortEvent.emit({data: this.data, sort: this.currentSort});
    } else {
      // イベント未設定ならデフォルトのソート処理を実行
      // dataに対してsortColumnの優先順でソートを行う（trueなら昇順、falseなら降順）
      this.data.sort((a, b) => {
        for (const key in this.currentSort) {
          if (this.currentSort.hasOwnProperty(key)) {
            const order = this.currentSort[key] ? 1 : -1;
            if (a[key] < b[key]) return -1 * order;
            if (a[key] > b[key]) return 1 * order;
          }
        }
        return 0;
      });
      this.cdr.markForCheck();
    }
  }
  
  trackByFn(index: number, row: { [key: string]: any }): any {
    if (this.trackByKeys && this.trackByKeys.length > 0) {
      const keyValue = this.trackByKeys.map(key => row[key]).join('_');
      return keyValue ?? index;
    }
    return index;
  }

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

  getRowComponent(rowTrackByKeys: Array<any>, column: string): any | undefined {
    return this.rowComponents.get(rowTrackByKeys.join('_'))?.get(column);
  }

  createInjector(key:string, row:{[key:string]:any}): Injector {
    const trackByValue = this.trackByFn(0, row);
    const data: InjectedData = {
      key: key,
      row: row,
      parentComponent: this.parentComponent,
      register: (instance: any) => {
        if (!this.rowComponents.has(trackByValue)) {
          this.rowComponents.set(trackByValue, new Map());
        }
        this.rowComponents.get(trackByValue)!.set(key, instance);
      },
      unregister: () => {
        this.rowComponents.get(trackByValue)?.delete(key);
      },
    };
    return Injector.create({
      providers: [
        {provide:'data', useValue: data},
        {provide:'handler', useValue: this.thLabels[key].handler || {}}
      ],
      parent: this.injector
    });
  }

  getSafeHtml(htmlString: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(htmlString);
  }

  // モバイル版用のメソッド
  isSmallColumn(key: string): boolean {
    return this.thLabels[key]?.mobile?.isSmall || false;
  }

  getMobileColumnStyle(key: string): { [key: string]: string } {
    const mobile = this.thLabels[key]?.mobile;
    if (!mobile) {
      return { 'min-width': '100px' };
    }
    
    const style: { [key: string]: string } = {};
    if (mobile.minWidth) {
      style['min-width'] = mobile.minWidth;
    }
    if (mobile.flex) {
      style['flex'] = mobile.flex;
    }
    
    return style;
  }

  getImageColumns(): string[] {
    return this.getVisibleColumns().filter(key => 
      this.thLabels[key]?.mobile?.isImage === true
    );
  }

  getImageEmptyText(key: string): string {
    return this.thLabels[key]?.mobile?.emptyText || '画像なし';
  }
}