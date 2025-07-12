import { Component, Inject, Input, OnDestroy, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InjectedData } from '../../table-base/flexible-table-base.component';
import { CellBaseComponent } from '../cell-base/cell-base.component';
import { LazyImageDirective } from './lazy-image.directive';

export interface CellThumbHandler {
  onClickImage: (data: any, component?: any) => void;
}

@Component({
  selector: 'app-cell-thumb',
  templateUrl: "cell-thumb.component.html",
  standalone: true,
  imports: [CommonModule, LazyImageDirective]
})
export class CellThumbComponent extends CellBaseComponent {
  onClick() {
    this.emitHandler('onClickImage', this);
  }
}
