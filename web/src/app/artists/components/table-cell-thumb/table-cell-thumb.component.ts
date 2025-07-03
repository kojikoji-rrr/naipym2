import { Component, Inject, Input, OnDestroy, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InjectedData } from '../../../common/components/flexible-table/flexible-table.component';
import { ApiService } from '../../../common/services/api.service';

@Component({
  selector: 'app-table-cell-thumb',
  standalone: true,
  imports: [CommonModule],
  templateUrl: "table-cell-thumb.component.html"
})
export class TableCellThumbComponent implements OnInit, OnDestroy {
  @Input() isMask:boolean = false;
  public value?:any;
  public handler: {[key:string]: string} = {};

  constructor(
    private apiService: ApiService,
    @Inject('data') public data: InjectedData,
    @Inject('handler') injectedHandler: {[key:string]: string}
  ) {
    this.value = data.row[data.key];
    this.handler = injectedHandler;
  }

  ngOnInit(): void {
    if (this.data.register) {
      this.data.register(this);
    }
  }

  ngOnDestroy(): void {
    if (this.data.unregister) {
      this.data.unregister();
    }
  }

  getThumbnailUrl() {
    if (this.value) {
      var base_url = `${this.apiService.API_URL}/${this.apiService.API_BASE}`;
      var image = this.isMask ? "sample" : this.value.toString();
      return `${base_url}/artist/thumbs/${image}`;
    } else {
      return '';
    }
  }

  onClick() {
    const methodName = this.handler['onClickImage'];
    if (methodName && this.data.parentComponent && typeof this.data.parentComponent[methodName] === 'function') {
      this.data.parentComponent[methodName](this.data, this);
    }
  }

}
