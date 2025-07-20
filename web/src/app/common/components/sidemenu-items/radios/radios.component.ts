import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'sidemenu-radios',
  standalone: true,
  imports: [NgClass],
  templateUrl: './radios.component.html'
})
export class SidemenuRadiosComponent {
  @Input() col: number = 2;
  @Input() name: string = '';
  @Input() changed: any = null;
  @Input() items: Record<string, any> = {};
  @Output() changedChange = new EventEmitter<any>();

  get itemEntries(): Array<{label: string, value: any}> {
    return Object.entries(this.items).map(([label, value]) => ({
      label,
      value
    }));
  }

  onRadioChange(value: any): void {
    this.changed = value;
    this.changedChange.emit(this.changed);
  }
}