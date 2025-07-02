import { AfterViewInit, Component, OnDestroy, TemplateRef, ViewChild } from '@angular/core';
import { SideMenuService } from '../common/services/side-menu.service';

@Component({
  selector: 'app-tags',
  imports: [],
  templateUrl: './tags.component.html'
})
export class TagsComponent implements AfterViewInit, OnDestroy {
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
