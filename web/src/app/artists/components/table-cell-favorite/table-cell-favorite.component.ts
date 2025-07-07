import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InjectedData } from '../../../common/components/flexible-table/flexible-table.component';

@Component({
  selector: 'app-table-cell-favorite',
  templateUrl: "table-cell-favorite.component.html",
  standalone: true,
  imports: [CommonModule]
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


  ngOnInit(): void {
    if (this.data.register) {
      this.data.register(this);
    }
  }

  ngOnDestroy(): void {
    if (this.data.unregister) {
      this.data.unregister();
    }
  }

  onToggle(event: Event) {
    const target = event.target as HTMLInputElement;
    this.value = target.checked;
    this.data.row[this.data.key] = this.value;
    const handlerFn = this.handler[TableCellFavoriteComponent.onChangeFavorite];
    if (typeof handlerFn === 'function') {
      handlerFn(this.data, this);
    }
  }
}