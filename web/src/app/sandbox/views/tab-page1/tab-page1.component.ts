import { Component, EventEmitter } from '@angular/core';
import { FlexibleTableDesktopComponent } from '../../../common/components/flexible-table/table-desktop/flexible-table-desktop.component';
import { FlexibleTableMobileComponent } from '../../../common/components/flexible-table/table-mobile/flexible-table-mobile.component';
import { FlexibleModalComponent } from '../../../common/components/flexible-modal/flexible-modal.component';

@Component({
  selector: 'app-tab-page1',
  imports: [FlexibleTableDesktopComponent, FlexibleTableMobileComponent, FlexibleModalComponent],
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