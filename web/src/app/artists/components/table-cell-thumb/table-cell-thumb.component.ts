import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContentSpinnerComponent } from '../../../common/components/content-spinner/content-spinner.component';

@Component({
  selector: 'app-table-cell-thumb',
  standalone: true,
  imports: [CommonModule, ContentSpinnerComponent],
  template: 'table-cell-thumb.component.html'
})
export class TableCellThumbComponent {
  isLoading:boolean = true;
  
  constructor(
    @Inject('data') public data: {key:string, row:{[key:string]: any}}
  ) {
    const value = data.row[data.key];
  }
}