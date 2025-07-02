import { Component, Inject } from '@angular/core';
import { InjectedData } from '../../../common/components/flexible-table/flexible-table.component';

@Component({
  selector: 'app-table-cell-link',
  templateUrl: "table-cell-link.component.html",
  standalone: true
})
export class TableCellLinkComponent {
  public value?:any;

  constructor(
    @Inject('data') public data: InjectedData
  ) {
    this.value = data.row[data.key];
  }
}