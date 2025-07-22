import { Component, Injector, ChangeDetectorRef, Input, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser';
import { CdkVirtualScrollViewport, ScrollingModule } from '@angular/cdk/scrolling';
import { FlexibleTableMobileComponent } from '../table-mobile/flexible-table-mobile.component';

@Component({
  selector: 'app-flexible-table-mobile',
  templateUrl: './flexible-table-mobile.component.html',
  standalone: true,
  imports: [CommonModule, ScrollingModule],
  host: {'[class]': 'hostClass'}
})
export class FlexibleTableMobileVScrollComponent extends FlexibleTableMobileComponent implements AfterViewInit {
  @ViewChild(CdkVirtualScrollViewport) viewport!: CdkVirtualScrollViewport;

  constructor(
    injector: Injector,
    sanitizer: DomSanitizer,
    cdr: ChangeDetectorRef
  ) {
    super(injector, sanitizer, cdr);
  }

  ngAfterViewInit(): void {
    this.viewport.checkViewportSize();
  }

  override onChangeData(before: Array<{ [key: string]: any; }>): void {
    this.viewport.checkViewportSize();
  }

  isLastRow(index: number): boolean {
    return index === this.data.length - 1;
  }

  isLastInArray(index: number, array: any[]): boolean {
    return index === array.length - 1;
  }
}