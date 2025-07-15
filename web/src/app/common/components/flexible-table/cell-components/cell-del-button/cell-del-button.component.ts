import { Component, Inject, Input, OnDestroy, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CellBaseComponent } from '../cell-base/cell-base.component';

export interface CellDelButtonHandler {
  onClick: (data: any, component?: any) => void;
}

@Component({
  selector: 'app-cell-del-button',
  templateUrl: "cell-del-button.component.html",
  standalone: true,
  imports: [CommonModule]
})
export class CellDelButtonComponent extends CellBaseComponent {
  onClick() {
    this.emitHandler('onClick', this);
  }
}
