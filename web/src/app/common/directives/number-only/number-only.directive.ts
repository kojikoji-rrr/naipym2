import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[appNumberOnly]',
  standalone: true
})
export class NumberOnlyDirective {
  @Input() appNumberOnly: boolean | string = true;

  constructor(private el: ElementRef) {}

  @HostListener('input', ['$event'])
  onInputChange(event: Event) {
    if (!this.isEnabled()) return;
    
    const input = event.target as HTMLInputElement;
    const value = input.value;
    
    if (value === '') {
      return; // 空文字列はそのまま
    }
    
    // 数字のみかチェック
    if (!/^\d+$/.test(value)) {
      input.value = '';
      input.dispatchEvent(new Event('input'));
      return;
    }
    
    // 先頭の0を除去（ただし"0"単体は空文字列に）
    const numericValue = parseInt(value, 10);
    const processedValue = numericValue === 0 ? '' : numericValue.toString();
    
    if (input.value !== processedValue) {
      input.value = processedValue;
      input.dispatchEvent(new Event('input'));
    }
  }

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if (!this.isEnabled()) return;
    
    // 数字、バックスペース、デリート、タブ、エスケープ、エンター、矢印キーのみ許可
    const allowedKeys = [
      'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
      'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'
    ];
    
    if (allowedKeys.includes(event.key)) {
      return;
    }
    
    // 数字キーのみ許可
    if (!/[0-9]/.test(event.key)) {
      event.preventDefault();
    }
  }

  @HostListener('paste', ['$event'])
  onPaste(event: ClipboardEvent) {
    if (!this.isEnabled()) return;
    
    event.preventDefault();
    const paste = event.clipboardData?.getData('text');
    
    if (paste && /^\d+$/.test(paste)) {
      const input = event.target as HTMLInputElement;
      input.value = paste;
      // ngModelの更新をトリガー
      input.dispatchEvent(new Event('input'));
    }
  }

  private isEnabled(): boolean {
    return this.appNumberOnly === true || this.appNumberOnly === '';
  }
}