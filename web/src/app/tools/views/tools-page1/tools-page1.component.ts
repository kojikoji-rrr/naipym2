import { CommonModule } from '@angular/common';
import { AfterViewChecked, AfterViewInit, Component, OnDestroy, TemplateRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ContentSpinnerComponent } from "../../../common/components/content-spinner/content-spinner.component";
import Prism from 'prismjs';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-markup';
import { PrettyHtmlPipe } from "../../../common/pipes/pretty-html/pretty-html.pipe";
import { ApiService } from '../../../common/services/api.service';
import { NotificationComponent } from '../../../common/components/notification/notification.component';
import { PanelLayoutComponent } from '../../../common/components/panel-layout/panel-layout.component';
import { LabelOneContentComponent } from '../../../common/components/label-one-content/label-one-content.component';
import { SideMenuService } from '../../../common/services/side-menu.service';

export interface SearchResult {
  code: number;
  error?:string;
  data?: {
    html: string,
    json: string
  };
}

@Component({
  selector: 'app-tools-page1',
  imports: [CommonModule, FormsModule, ContentSpinnerComponent, PrettyHtmlPipe, NotificationComponent, PanelLayoutComponent, LabelOneContentComponent],
  templateUrl: './tools-page1.component.html'
})
export class ToolsPage1Component implements AfterViewChecked, AfterViewInit, OnDestroy {
  @ViewChild('sideMenuContent') sideMenuContent!: TemplateRef<any>;
  @ViewChild("notice") noticeComponent!: NotificationComponent;
  urlInput:string = "";
  isLoading:boolean = false;
  result?:{html: string, json: string};

  constructor(
    private sideMenuService: SideMenuService,
    public apiService:ApiService
  ) {}
  
  // ビューチェック時にテキストハイライトをON
  ngAfterViewChecked() {
    Prism.highlightAll();
  }

  // ビューの初期化後にテンプレートをサービスにセットする
  ngAfterViewInit(): void {
    this.sideMenuService.setContent(this.sideMenuContent);
  }

  // コンポーネントが破棄される時にテンプレートをクリアする
  ngOnDestroy(): void {
    this.sideMenuService.clearContent();
  }

  search() {
    if (!this.urlInput.trim()) return;
    
    this.isLoading = true;
    this.result = undefined;
    this.noticeComponent.clear();
    
    this.apiService.fetch(this.urlInput).subscribe({
      next: (response: SearchResult) => {
        if (response.code === 200) {
          this.result = response.data;
        } else {
          this.noticeComponent.setNoticeError(response.code, response.error!);
        }
        this.isLoading = false;
      }
    });
  }
}