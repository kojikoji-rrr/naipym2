import { Component, EventEmitter } from '@angular/core';
import { FlexibleTableComponent } from '../../../common/components/flexible-table/flexible-table.component';
import { FlexibleModalComponent } from '../../../common/components/flexible-modal/flexible-modal.component';

@Component({
  selector: 'app-tab-page1',
  imports: [FlexibleTableComponent, FlexibleModalComponent],
  templateUrl: './tab-page1.component.html'
})
export class TabPage1Component {
  isOpen = false;
  
  okEvent = new EventEmitter<void>();
  closeEvent = new EventEmitter<void>();

  constructor() {
    this.okEvent.subscribe(() => this.onOk());
    this.closeEvent.subscribe(() => this.onClose());
  }

  onOk() {
    console.log('OK clicked');
    this.isOpen = false;
  }

  onClose() {
    console.log('Close clicked');
    this.isOpen = false;
  }
}