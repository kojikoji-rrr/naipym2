import { Component, Inject } from '@angular/core';
import { InjectedData } from '../../../common/components/flexible-table/flexible-table.component';

@Component({
  selector: 'app-table-cell-copy',
  templateUrl: "table-cell-copy.component.html",
  standalone: true
})
export class TableCellCopyComponent {
  public value?:any;

  constructor(
    @Inject('data') public data: InjectedData
  ) {
    this.value = data.row[data.key];
  }

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