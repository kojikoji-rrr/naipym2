import { Component, Injector, ChangeDetectorRef, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser';
import { FlexibleTableBaseComponent } from '../table-base/flexible-table-base.component';

// デスクトップ用テーブル列定義
export interface FlexibleTableDesktopColumn {
  // 列幅
  width?: string;
  // ヘッダclass
  colClass?: string;
  // class
  rowClass?: string;
  // style
  rowStyle?: {[key:string]: string};
}

@Component({
  selector: 'app-flexible-table-desktop',
  templateUrl: './flexible-table-desktop.component.html',
  standalone: true,
  imports: [CommonModule],
  host: {'[class]': 'hostClass'},
})
export class FlexibleTableDesktopComponent extends FlexibleTableBaseComponent {
  // 行の高さ（全体指定）
  @Input() rowHeight: number = 24;
  // スタイル設定
  @Input() styles: {[key:string]: FlexibleTableDesktopColumn} = {}
  // ホスト用クラス設定
  @Input() hostClass:string = "";
  // 外枠の表示設定
  @Input() nonOutBorder:boolean = false;

  constructor(
    injector: Injector,
    sanitizer: DomSanitizer,
    cdr: ChangeDetectorRef
  ) {
    super(injector, sanitizer, cdr);
  }

  getWidth(key: string) {
    if (this.styles[key] && this.styles[key].width) {
      return this.styles[key].width;
    } else if(this.styles["*"] && this.styles["*"].width) {
      return this.styles["*"].width;
    }
    return 'auto';
  }
  
  getColClass(key:string) {
    if (this.styles[key] && this.styles[key].colClass) {
      return this.styles[key].colClass;
    } else if(this.styles["*"] && this.styles["*"].colClass) {
      return this.styles["*"].colClass;
    }
    return undefined;
  }

  getRowClass(key:string) {
    if (this.styles[key] && this.styles[key].rowClass) {
      return this.styles[key].rowClass;
    } else if (this.styles["*"] && this.styles["*"].rowClass) {
      return this.styles["*"].rowClass;
    }
    return "";
  }

  getRowStyle(key:string) {
    if (this.styles[key] && this.styles[key].rowStyle) {
      return this.styles[key].rowStyle;
    } else if (this.styles["*"] && this.styles["*"].rowStyle) {
      return this.styles["*"].rowStyle;
    }
    return undefined;
  }
}