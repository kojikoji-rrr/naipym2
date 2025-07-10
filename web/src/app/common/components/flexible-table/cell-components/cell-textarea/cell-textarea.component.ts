import { Component, Inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CellBaseComponent } from '../cell-base/cell-base.component';

export interface CellTextareaArgs {
  memoList: string[];
}

export interface CellTextareaHandler {
  onChangeInput: (data: any, component?: any) => void;
  updateMemoList: (data:any, component?: any) => void;
}

@Component({
  selector: 'app-cell-textarea',
  templateUrl: "cell-textarea.component.html",
  standalone: true,
  imports: [CommonModule]
})
export class CellTextareaComponent extends CellBaseComponent {
  @ViewChild('TextArea') textarea!: HTMLDivElement;
  
  onSelect(event: Event) {
    const target = event.target as HTMLSelectElement;
    
    if (target.value) {
      this.changeValue(target.value);
      target.selectedIndex = 0;
      this.emitHandler('onChangeInput', this);
    }
  }

  onBlur(event: Event) {
    const target = event.target as HTMLDivElement;

    if (this.value !== target.innerText) {
      this.changeValue(target.innerText);
      this.emitHandler('onChangeInput', this);

      var trimValue = target.innerText?.trim();
      if (trimValue && !this.args.memoList.includes(trimValue)) {
        this.args.memoList.push(trimValue);
        this.emitHandler('updateMemoList', this);
      }
    }
  }
}