import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContentSpinnerComponent } from '../../../common/components/content-spinner/content-spinner.component';
import { InjectedData } from '../../../common/components/flexible-table/flexible-table.component';
import { ApiService } from '../../../common/services/api.service';

@Component({
  selector: 'app-table-cell-thumb',
  standalone: true,
  imports: [CommonModule, ContentSpinnerComponent],
  templateUrl: "table-cell-thumb.component.html"
})
export class TableCellThumbComponent implements OnInit, OnDestroy {
  public isLoading:boolean = true;
  public isMask:boolean = false;
  public value?:any;

  constructor(
    private apiService: ApiService,
    @Inject('data') public data: InjectedData
  ) {
    this.value = data.row[data.key];
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
}