import { Component, Inject } from '@angular/core';

@Component({
  selector: 'app-table-cell-copy',
  template: 'table-cell-copy.component.html',
  standalone: true
})
export class TableCellCopyComponent {
  constructor(
    @Inject('data') public data: {key:string, row:{[key:string]: any}}
  ) {
    const value = data.row[data.key];
  }

  // クリップボードへコピー
  copyToClipboard(event: Event): void {
    // イベント伝播を停止
    event.preventDefault();
    event.stopPropagation();
    
    var formattedText = String(this.data.key).replace(/_/g, ' ')
    const textToCopy = `artist:${formattedText}`;
    navigator.clipboard.writeText(textToCopy);
  }
}