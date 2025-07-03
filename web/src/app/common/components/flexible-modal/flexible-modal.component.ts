import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';

// モーダルフッターのボタン情報
export interface FlexibleModalButton {
  // ボタンラベル
  label: string;
  // 原色フラグ
  isPrimary: boolean;
  // 呼出メソッド
  event: EventEmitter<void>;
}

@Component({
  selector: 'app-flexible-modal',
  imports: [CommonModule],
  templateUrl: './flexible-modal.component.html'
})
export class FlexibleModalComponent {
  @Output() okEvent = new EventEmitter<void>();
  @Output() closeEvent = new EventEmitter<void>();
  @Input() title: string = '';
  @Input() buttons: Array<FlexibleModalButton> = [];
  @Input() showBackdrop: boolean = true;
  @Input() showCloseButton: boolean = true;
  @Input() isOpen: boolean = false;
  @Input() size: 'sm' | 'md' | 'lg' | 'xl' | 'full' = 'md';
  @Input() customWidth: string = '';
  @Input() customHeight: string = '';
  @Input() bodyClass:string = '';
  @Input() bodyStyle:{[key: string]: string} = {}

  onOk() {
    this.okEvent.emit();
  }

  onClose() {
    this.closeEvent.emit();
  }

  onClickBtn(btn:FlexibleModalButton) {
    btn.event.emit();
  }

  getSizeClass(): string {
    const sizeClasses = {
      'sm': 'max-w-sm',
      'md': 'max-w-lg', 
      'lg': 'max-w-2xl',
      'xl': 'max-w-4xl',
      'full': 'max-w-full w-full h-full'
    };
    return sizeClasses[this.size];
  }

  getCustomStyles(): {[key: string]: string} {
    const styles: {[key: string]: string} = {};
    if (this.customWidth) styles['width'] = this.customWidth;
    if (this.customHeight) styles['height'] = this.customHeight;
    return styles;
  }
}