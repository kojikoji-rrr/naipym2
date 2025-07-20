import { Component, Input, OnInit, TemplateRef, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-resizable-panels',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './resizable-panels.component.html'
})
export class ResizablePanelsComponent implements OnInit {
  @Input() leftTemplate!: TemplateRef<any>;
  @Input() rightTemplate!: TemplateRef<any>;
  @Input() initialLeftWidth: number = 400;
  @Input() minWidth: number = 200;
  @Input() containerClass: string = '';
  @Output() onResize = new EventEmitter<number>();

  leftPanelWidth: number = 400;
  isResizing: boolean = false;

  ngOnInit() {
    this.leftPanelWidth = this.initialLeftWidth;
  }

  onResizeStart(event: MouseEvent) {
    this.isResizing = true;
    event.preventDefault();
    
    // リサイザーの初期位置を取得
    const startX = event.clientX;
    const startWidth = this.leftPanelWidth;
    
    // コンテナの親要素を正確に取得
    const containerElement = event.target as HTMLElement;
    const parentContainer = containerElement.parentElement;
    
    const onMouseMove = (e: MouseEvent) => {
      if (this.isResizing && parentContainer) {
        const containerRect = parentContainer.getBoundingClientRect();
        const deltaX = e.clientX - startX;
        const newWidth = startWidth + deltaX;
        
        // CSS Grid用：リサイザー幅(8px)を考慮した最大幅を計算
        const maxWidth = containerRect.width - this.minWidth - 8;
        
        if (newWidth >= this.minWidth && newWidth <= maxWidth) {
          this.leftPanelWidth = newWidth;
          this.onResize.emit(newWidth);
        }
      }
    };

    const onMouseUp = () => {
      this.isResizing = false;
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }
}