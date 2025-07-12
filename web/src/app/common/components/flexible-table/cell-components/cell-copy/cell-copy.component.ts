import { Component, Inject } from '@angular/core';
import { CellBaseComponent } from '../cell-base/cell-base.component';

@Component({
  selector: 'app-cell-copy',
  templateUrl: "cell-copy.component.html",
  standalone: true
})
export class CellCopyComponent extends CellBaseComponent {
  isPressed = false;
  // クリップボードへコピー
  copyToClipboard(event: Event): void {  
    var formattedText = String(this.value).replace(/_/g, ' ')
    const textToCopy = `artist:${formattedText}`;
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(textToCopy);
    } else {
      const textArea = document.createElement('textarea');
      textArea.value = textToCopy;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
  }

  // タッチスタートイベント（スマホ対応）
  onTouchStart(event: TouchEvent): void {
    this.isPressed = true;
    setTimeout(() => this.isPressed = false, 200);
    this.copyToClipboard(event);
  }
}