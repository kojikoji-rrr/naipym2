import { CommonModule } from '@angular/common';
import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-content-spinner',
  imports: [CommonModule],
  templateUrl: './content-spinner.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContentSpinnerComponent {
  @Input() showSpinner:boolean = false;
  @Input() showContentAlways:boolean = false;
  @Input() size: string = '48px';
  @Input() padding:string = '48px';
}