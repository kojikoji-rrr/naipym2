import { AfterViewInit, Component, OnDestroy, TemplateRef, ViewChild } from '@angular/core';
import { SideMenuService } from '../common/services/side-menu.service';
import { FlexibleTableComponent } from '../common/components/flexible-table/flexible-table.component';

@Component({
  selector: 'app-artists',
  imports: [FlexibleTableComponent],
  templateUrl: './artists.component.html',
  styleUrl: './artists.component.css'
})
export class ArtistsComponent implements AfterViewInit, OnDestroy {
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
