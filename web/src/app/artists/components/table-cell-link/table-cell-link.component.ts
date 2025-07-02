import { Component, Inject } from '@angular/core';

@Component({
  selector: 'app-table-cell-link',
  template: `table-cell-link.component.html`,
  standalone: true
})
export class TableCellLinkComponent {
  constructor(
    @Inject('data') public data: {key:string, row:{[key:string]: any}}
  ) {
    const value = data.row[data.key];
  }
}