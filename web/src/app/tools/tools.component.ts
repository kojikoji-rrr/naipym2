import { AfterViewInit, Component, OnDestroy, TemplateRef, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SideMenuService } from '../common/services/side-menu.service';
import { TabLayoutComponent } from '../common/components/tab-layout/tab-layout.component';
import { PageHeaderComponent } from '../common/components/page-header/page-header.component';

@Component({
  selector: 'app-tools',
  imports: [RouterOutlet, PageHeaderComponent, TabLayoutComponent],
  templateUrl: './tools.component.html'
})
export class ToolsComponent implements AfterViewInit, OnDestroy {
  @ViewChild('sideMenuContent') sideMenuContent!: TemplateRef<any>;

  constructor(private sideMenuService: SideMenuService) {}

  // ビューの初期化後にテンプレートをサービスにセットする
  ngAfterViewInit(): void {
    this.sideMenuService.setContent(this.sideMenuContent);
  }

  // コンポーネントが破棄される時にテンプレートをクリアする
  ngOnDestroy(): void {
    this.sideMenuService.clearContent();
  }
}