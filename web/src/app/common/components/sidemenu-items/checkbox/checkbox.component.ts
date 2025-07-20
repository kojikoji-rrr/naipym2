import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'sidemenu-checkbox',
  standalone: true,
  templateUrl: './checkbox.component.html'
})
export class SidemenuCheckboxComponent {
  @Input() label: string = '';
  @Input() checked: boolean = false;
  @Output() checkedChange = new EventEmitter<boolean>();

  onCheckedChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.checked = target.checked;
    this.checkedChange.emit(this.checked);
  }
}