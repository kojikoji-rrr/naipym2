import { Component, Inject } from '@angular/core';
import { CellBaseComponent } from '../cell-base/cell-base.component';

@Component({
  selector: 'app-cell-copy',
  templateUrl: "cell-copy.component.html",
  standalone: true
})
export class CellCopyComponent extends CellBaseComponent {
  // クリップボードへコピー
  copyToClipboard(event: Event): void {
    // イベント伝播を停止
    event.preventDefault();
    event.stopPropagation();
    
    var formattedText = String(this.value).replace(/_/g, ' ')
    const textToCopy = `artist:${formattedText}`;
    navigator.clipboard.writeText(textToCopy);
  }
}