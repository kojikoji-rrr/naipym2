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
  @Input() rowHeight?: string;
  // スタイル設定
  @Input() styles: {[key:string]: FlexibleTableDesktopColumn} = {}
  @Input() hostClass:string = "";
  @Input() nonOutBorder:boolean = false;

  constructor(
    injector: Injector,
    sanitizer: DomSanitizer,
    cdr: ChangeDetectorRef
  ) {
    super(injector, sanitizer, cdr);
  }
}