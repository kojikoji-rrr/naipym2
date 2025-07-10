import { Component, Inject } from '@angular/core';
import { InjectedData } from '../../table-base/flexible-table-base.component';
import { CellBaseComponent } from '../cell-base/cell-base.component';

@Component({
  selector: 'app-cell-link',
  templateUrl: "cell-link.component.html",
  standalone: true
})
export class CellLinkComponent extends CellBaseComponent {}