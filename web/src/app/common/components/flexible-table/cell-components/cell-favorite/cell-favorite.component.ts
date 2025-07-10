import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CellBaseComponent } from '../cell-base/cell-base.component';

export interface CellFavoriteHandler {
  onChangeFavorite: (data: any, component?: any) => void;
}

@Component({
  selector: 'app-cell-favorite',
  templateUrl: "cell-favorite.component.html",
  standalone: true,
  imports: [CommonModule]
})
export class CellFavoriteComponent extends CellBaseComponent {
  onToggle(event: Event) {
    var target = event.target as HTMLInputElement;

    this.changeValue(target.checked);
    this.emitHandler('onChangeFavorite', this);
  }
}