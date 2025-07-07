import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InjectedData } from '../../../common/components/flexible-table/flexible-table.component';

@Component({
  selector: 'app-table-cell-textarea',
  templateUrl: "table-cell-textarea.component.html",
  standalone: true,
  imports: [CommonModule]
})
export class TableCellTextareaComponent {
  public static readonly onChangeInput = 'onChangeInput';
  public value?:string;
  public handler: {[key:string]: (data: InjectedData, component?: any) => void} = {};

  constructor(
    @Inject('data') public data: InjectedData,
    @Inject('handler') injectedHandler: {[key:string]: (data: InjectedData, component?: any) => void}
  ) {
    this.value = data.row[data.key] ?? '';
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

  onBlur(event: Event) {
    const target = event.target as HTMLInputElement;
    if (this.value !== target.value) {
      this.value = target.value;
      this.data.row[this.data.key] = target.value;
      const handlerFn = this.handler[TableCellTextareaComponent.onChangeInput];
      if (typeof handlerFn === 'function') {
        handlerFn(this.data, this);
      }
    }
  }
}