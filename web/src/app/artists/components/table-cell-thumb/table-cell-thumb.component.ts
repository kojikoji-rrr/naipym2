import { Component, Inject, Input, OnDestroy, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InjectedData } from '../../../common/components/flexible-table/flexible-table.component';
import { ApiService } from '../../../common/services/api.service';

@Component({
  selector: 'app-table-cell-thumb',
  standalone: true,
  imports: [CommonModule],
  templateUrl: "table-cell-thumb.component.html"
})
export class TableCellThumbComponent {
  public static readonly onClickImage = 'onClickImage';
  public value?:any;
  public handler: {[key:string]: (data: InjectedData, component?: any) => void} = {};

  constructor(
    @Inject('data') public data: InjectedData,
    @Inject('handler') injectedHandler: {[key:string]: (data: InjectedData, component?: any) => void}
  ) {
    this.value = data.row[data.key];
    this.handler = injectedHandler;
  }

  onClick() {
    const handlerFn = this.handler[TableCellThumbComponent.onClickImage];
    if (typeof handlerFn === 'function') {
      handlerFn(this.data, this);
    }
  }
}
