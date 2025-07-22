import { Component, Injector, ChangeDetectorRef, Input, ViewChild, AfterViewChecked, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexibleTableDesktopComponent } from '../table-desktop/flexible-table-desktop.component';
import { CdkVirtualScrollViewport, ScrollingModule } from '@angular/cdk/scrolling'

// デスクトップ用テーブル列定義
export interface FlexibleTableDesktop {
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
  selector: 'app-flexible-table-desktop-vscroll',
  templateUrl: './flexible-table-desktop-vscroll.component.html',
  standalone: true,
  imports: [CommonModule, ScrollingModule],
  host: {'[class]': 'hostClass'},
})
export class FlexibleTableDesktopVScrollComponent extends FlexibleTableDesktopComponent implements AfterViewInit {
  @ViewChild(CdkVirtualScrollViewport) viewport!: CdkVirtualScrollViewport;

  ngAfterViewInit(): void {
    this.viewport.checkViewportSize();
  }

  override onChangeData(before: Array<{ [key: string]: any; }>): void {
    this.viewport.checkViewportSize();
  }
}