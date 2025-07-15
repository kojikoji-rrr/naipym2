import { CommonModule } from '@angular/common';
import { AfterViewChecked, Component, EventEmitter, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ContentSpinnerComponent } from '../../../common/components/content-spinner/content-spinner.component';
import { PrettyHtmlPipe } from '../../../common/pipes/pretty-html/pretty-html.pipe';
import { NumberOnlyDirective } from '../../../common/directives/number-only/number-only.directive';
import { ApiService } from '../../../common/services/api.service';
import Prism from 'prismjs';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-markup';
import { NotificationComponent } from '../../../common/components/notification/notification.component';

export interface SearchResult {
  code: number;
  error?:string;
  data?: {
    html: string[],
    json: string
  };
}

@Component({
  selector: 'app-tools-page2',
  imports: [CommonModule, FormsModule, ContentSpinnerComponent, PrettyHtmlPipe, NumberOnlyDirective, NotificationComponent],
  templateUrl: './tools-page2.component.html'
})
export class ToolsPage2Component implements AfterViewChecked {
  @ViewChild("notice") noticeComponent!: NotificationComponent;
  strInput:string = "";
  pageInput:string = "1";
  isLoading:boolean = false;
  result?:SearchResult;

  constructor(public apiService:ApiService) {}
  
  ngAfterViewChecked() {
    Prism.highlightAll();
  }

  search() {
    if (!this.strInput.trim()) return;
    
    this.isLoading = true;
    this.result = undefined;
    this.noticeComponent.clear();
    
    this.apiService.searchDanbooruByArtist(this.strInput, this.pageInput).subscribe({
      next: (response: SearchResult) => {
        if (response.code === 200) {
          this.result = response;
        } else {
          this.noticeComponent.setNoticeError(response.code, response.error!);
        }
        this.isLoading = false;
      }
    });
  }
}