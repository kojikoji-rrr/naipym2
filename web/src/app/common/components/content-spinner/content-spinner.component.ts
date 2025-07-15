import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { SpinnerComponent } from '../spinner/spinner.component';

@Component({
  selector: 'app-content-spinner',
  imports: [CommonModule, SpinnerComponent],
  templateUrl: './content-spinner.component.html'
})
export class ContentSpinnerComponent {
  @Input() showSpinner:boolean = false;
  @Input() showContentAlways:boolean = false;
  @Input() size: string = '48px';
  @Input() padding:string = '48px';
}