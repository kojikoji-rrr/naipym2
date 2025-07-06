import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InjectedData } from '../../../common/components/flexible-table/flexible-table.component';

@Component({
  selector: 'app-table-cell-flag',
  templateUrl: "table-cell-flag.component.html",
  standalone: true,
  imports: [CommonModule]
})
export class TableCellFlagComponent {
  public value?:any;

  constructor(
    @Inject('data') public data: InjectedData
  ) {
    this.value = data.row[data.key];
  }
}