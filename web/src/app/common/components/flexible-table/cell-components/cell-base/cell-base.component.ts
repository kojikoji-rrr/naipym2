import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { InjectedData } from '../../table-base/flexible-table-base.component';

@Component({
  standalone: true,
  selector: 'app-cell-base',
  template: ''
})
export abstract class CellBaseComponent implements OnInit, OnDestroy {
  public value?: any;

  constructor(
    @Inject('data') public data: InjectedData,
    @Inject('args') public args: any,
    @Inject('handler') public handler: {[key:string]: (data: InjectedData, component?: any) => void}
  ) {
    this.value = data.row[data.key];
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

  emitHandler(handlerName: string, component?: any): void {
    const handlerFn = this.handler[handlerName];
    if (typeof handlerFn === 'function') {
      handlerFn(this.data, component);
    }
  }

  changeValue(value:any) {
      this.value = value;
      this.data.row[this.data.key] = value;
  }
}