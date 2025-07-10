import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CellBaseComponent } from '../cell-base/cell-base.component';

@Component({
  selector: 'app-cell-flag',
  templateUrl: "cell-flag.component.html",
  standalone: true,
  imports: [CommonModule]
})
export class CellFlagComponent extends CellBaseComponent {}