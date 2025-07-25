import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, Injector, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SafeHtml, DomSanitizer } from '@angular/platform-browser';

// 共通列定義
export interface FlexibleTableColumn {
  // ヘッダ名
  label: string;
  // データ表示コンポーネント
  component?: any;
  // 子の初期化用データ
  args?: any;
  // コンポーネントハンドラー（親コンポーネントのメソッド名を文字列で指定）
  handler?: {[key: string]: (data: any, component?: any) => void};
}

// 子に渡すデータ定義
export interface InjectedData {
  // 呼出し元
  parentComponent: any;
  // カラムキー
  key: string;
  // 列全体のデータ
  row: { [key: string]: any };
  // 登録処理
  register: (instance: any) => void;
  // 破棄処理
  unregister: () => void;
}

@Component({
  template: '',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FlexibleTableBaseComponent {
  // 表示データ
  _data: Array<{[key:string]: any}> = [];
  @Input() set data(value:any) {
    var before = {...this._data};
    this._data = value;
    this.onChangeData(before);
  } get data(): Array<{[key:string]: any}> {
    return this._data;
  }
  // ヘッダラベル
  @Input() thLabels: {[key:string]: FlexibleTableColumn} = {}
  // 非表示カラム
  @Input() hideColumns: Array<string> = [];
  // データが無くても表示する項目
  @Input() forcefulColumns: Array<string> = [];
  // ソート初期値
  @Input() sortedColumns: {[key:string]: boolean} = {}
  // 親コンポーネント参照
  @Input() parentComponent?: any;
  // ソートイベント（未設定の場合デフォルト処理）
  @Output() sortEvent = new EventEmitter<{[key:string]: boolean}>();
  // 列コンポーネント
  rowComponents = new Map<any, Map<string, any>>();
  // SafeHtmlキャッシュ
  private safeHtmlCache = new Map<string, SafeHtml>();
  // Injectorキャッシュ
  private injectorCache = new Map<string, Injector>();

  constructor(
    public injector: Injector,
    private sanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef
  ) {}

  onChangeData(before: Array<{[key:string]: any}>) {}

  onChangeSort(key: string) {
    // ソートキー追加（新しいオブジェクトを作成）
    if (!this.sortedColumns.hasOwnProperty(key)) {
      this.sortedColumns[key] = false;
    } else if (!this.sortedColumns[key]) {
      this.sortedColumns[key] = true;
    } else {
      delete this.sortedColumns[key];
    }
    // ソート処理
    this.sort();
  }

  clearSort(onEvent:boolean = true) {
    this.sortedColumns = {};
    if (onEvent) {
      this.sort();
    }
  }

  sort() {
    if (this.sortEvent.observers.length > 0) {
      // イベント設定済ならイベント発火。呼出元でソート後の結果をdataに再設定する可能性もあるのでソートはしない。
      this.sortEvent.emit(this.sortedColumns);
    } else {
      // イベント未設定ならデフォルトのソート処理を実行。dataに対してsortColumnの優先順でソートを行う（trueなら昇順、falseなら降順）
      this.data.sort((a, b) => {
        for (const key in this.sortedColumns) {
          if (this.sortedColumns.hasOwnProperty(key)) {
            const order = this.sortedColumns[key] ? 1 : -1;
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
    return row['trackByKey'] ?? Object.values(row).filter((val)=> ['string','number'].includes(typeof val)).join("_");
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
    const cacheKey = `${trackByValue}_${key}`;
    
    // キャッシュされたInjectorがあれば再利用
    if (this.injectorCache.has(cacheKey)) {
      const cachedInjector = this.injectorCache.get(cacheKey)!;
      // データを更新
      const data = cachedInjector.get('data') as InjectedData;
      data.row = row; // 最新のrowデータで更新
      return cachedInjector;
    }
    
    const data: InjectedData = {
      parentComponent: this.parentComponent,
      key: key,
      row: row,
      register: (instance: any) => {
        if (!this.rowComponents.has(trackByValue)) {
          this.rowComponents.set(trackByValue, new Map());
        }
        this.rowComponents.get(trackByValue)!.set(key, instance);
      },
      unregister: () => {
        this.rowComponents.get(trackByValue)?.delete(key);
        this.injectorCache.delete(cacheKey); // キャッシュも削除
      },
    };
    
    const injector = Injector.create({
      providers: [
        {provide:'data', useValue: data},
        {provide:'args', useValue: this.thLabels[key].args},
        {provide:'handler', useValue: this.thLabels[key].handler || {}}
      ],
      parent: this.injector
    });
    
    // Injectorをキャッシュ
    this.injectorCache.set(cacheKey, injector);
    return injector;
  }

  getSafeHtml(htmlString: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(htmlString);
  }

  getCachedSafeHtml(htmlString: string): SafeHtml {
    const cacheKey = String(htmlString);
    if (!this.safeHtmlCache.has(cacheKey)) {
      this.safeHtmlCache.set(cacheKey, this.sanitizer.bypassSecurityTrustHtml(htmlString));
    }
    return this.safeHtmlCache.get(cacheKey)!;
  }

  clearInjectorCache() {
    this.injectorCache.clear();
    this.cdr.detectChanges();
  }
}
