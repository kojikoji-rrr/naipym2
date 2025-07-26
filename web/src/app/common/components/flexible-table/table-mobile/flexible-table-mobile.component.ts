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
  imports: [CommonModule],
  host: {'[class]': 'hostClass'},
})
export class FlexibleTableMobileComponent extends FlexibleTableBaseComponent {
  // 行の高さ
  @Input() bottomHeight: number = 180;
  // ヘッダ行の高さ
  @Input() topHeight: number = 80;
  // ヘッダ行の高さ
  @Input() middleHeight: number = 24;
  // スタイル設定
  @Input() styles: {[key:string]: FlexibleTableMobileColumn} = {}
  // ホスト用クラス設定
  @Input() hostClass:string = "";
  
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

  getWidth(key:string) {
    if (this.styles[key] && this.styles[key].width) {
      return this.styles[key].width;
    } else if (this.styles["*"] && this.styles["*"].width) {
      return this.styles["*"].width;
    }
    return '100px';
  }

  getRowClass(key:string) {
    if (this.styles[key] && this.styles[key].rowClass) {
      return this.styles[key].rowClass;
    } else if (this.styles["*"] && this.styles["*"].rowClass) {
      return this.styles["*"].rowClass;
    }
    return '';
  }
  
  getRowStyle(key:string) {
    if (this.styles[key] && this.styles[key].rowStyles) {
      return this.styles[key].rowStyles;
    } else if (this.styles["*"] && this.styles["*"].rowStyles) {
      return this.styles["*"].rowStyles;
    }
    return undefined;
  }
}