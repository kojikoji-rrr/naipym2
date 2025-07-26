import { Component, Injector, ChangeDetectorRef, Input, AfterViewInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser';
import { FlexibleTableBaseComponent } from '../table-base/flexible-table-base.component';
import { FlexibleTableDesktopComponent } from '../table-desktop/flexible-table-desktop.component';
import { CdkVirtualScrollViewport, ScrollingModule } from '@angular/cdk/scrolling'

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
    if (this && this.viewport) {
      this.viewport.checkViewportSize();
    }
  }
}