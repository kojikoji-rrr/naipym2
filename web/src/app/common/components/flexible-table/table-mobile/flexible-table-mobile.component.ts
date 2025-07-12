import { Component, Injector, ChangeDetectorRef, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser';
import { FlexibleTableBaseComponent } from '../table-base/flexible-table-base.component';

// モバイル用テーブル列定義
export interface FlexibleTableMobileColumn {
  // 列幅
  width?: string;
  // 値クラス
  rowClass?: string;
  // 値スタイル
  rowStyles?: {[key:string]: any};
  // 画像上部か否か
  isViewMiddle?: boolean;
  // ヘッダデータか否か
  isViewBottom?: boolean;
}

@Component({
  selector: 'app-flexible-table-mobile',
  templateUrl: './flexible-table-mobile.component.html',
  standalone: true,
  imports: [CommonModule]
})
export class FlexibleTableMobileComponent extends FlexibleTableBaseComponent {
  // 行の高さ
  @Input() rowHeight?: string = '180px';
  // ヘッダ行の高さ
  @Input() headerHeight?: string = '80px';
  // スタイル設定
  @Input() styles: {[key:string]: FlexibleTableMobileColumn} = {}

  constructor(
    injector: Injector,
    sanitizer: DomSanitizer,
    cdr: ChangeDetectorRef
  ) {
    super(injector, sanitizer, cdr);
  }

  getTopColumns() {
    return this.getVisibleColumns().filter(key => !this.styles[key]?.isViewMiddle && !this.styles[key]?.isViewBottom);
  }

  getMiddleColumns(): string[] {
    return this.getVisibleColumns().filter(key => this.styles[key]?.isViewMiddle);
  }

  getBottomColumns(): string[] {
    return this.getVisibleColumns().filter(key => this.styles[key]?.isViewBottom);
  }
}