import { CommonModule } from "@angular/common";
import { Component, AfterViewInit, OnDestroy, ViewChild, TemplateRef } from "@angular/core";
import { ApiService } from "../common/services/api.service";
import { SideMenuService } from "../common/services/side-menu.service";
import { PageHeaderComponent } from "../common/components/page-header/page-header.component";

@Component({
  selector: 'app-batch-manager',
  imports: [CommonModule, PageHeaderComponent],
  templateUrl: './batch-manager.component.html'
})
export class BatchManagerComponent implements AfterViewInit, OnDestroy{
  @ViewChild('sideMenuContent') sideMenuContent!: TemplateRef<any>;

  constructor(
    private sideMenuService: SideMenuService,
    private apiService: ApiService
  ) {}

  ngAfterViewInit() {
    this.sideMenuService.setContent(this.sideMenuContent);
  }

  ngOnDestroy(): void {
    this.sideMenuService.clearContent();
  }
}
