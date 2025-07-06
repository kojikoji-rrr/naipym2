import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InjectedData } from '../../../common/components/flexible-table/flexible-table.component';

@Component({
  selector: 'app-table-cell-favorite',
  templateUrl: "table-cell-favorite.component.html",
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class TableCellFavoriteComponent {
  public static readonly onChangeFavorite = 'onChangeFavorite';
  public value?:boolean;
  public handler: {[key:string]: (data: InjectedData, component?: any) => void} = {};

  constructor(
    @Inject('data') public data: InjectedData,
    @Inject('handler') injectedHandler: {[key:string]: (data: InjectedData, component?: any) => void}
  ) {
    this.value = data.row[data.key] ?? false;
    this.handler = injectedHandler;
  }

  onChange() {
    this.value = !this.value;
    const handlerFn = this.handler[TableCellFavoriteComponent.onChangeFavorite];
    if (typeof handlerFn === 'function') {
      handlerFn(this.data, this);
    }
  }
}