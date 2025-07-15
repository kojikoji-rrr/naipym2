import { CommonModule } from '@angular/common';
import { AfterViewChecked, Component, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ContentSpinnerComponent } from "../../../common/components/content-spinner/content-spinner.component";
import Prism from 'prismjs';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-markup';
import { PrettyHtmlPipe } from "../../../common/pipes/pretty-html/pretty-html.pipe";
import { ApiService } from '../../../common/services/api.service';
import { NotificationComponent } from '../../../common/components/notification/notification.component';

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
  imports: [CommonModule, FormsModule, ContentSpinnerComponent, PrettyHtmlPipe, NotificationComponent],
  templateUrl: './tools-page1.component.html'
})
export class ToolsPage1Component implements AfterViewChecked {
  @ViewChild("notice") noticeComponent!: NotificationComponent;
  urlInput:string = "";
  isLoading:boolean = false;
  result?:SearchResult;

  constructor(
    public apiService:ApiService
  ) {}
  
  ngAfterViewChecked() {
    Prism.highlightAll();
  }

  search() {
    if (!this.urlInput.trim()) return;
    
    this.isLoading = true;
    this.result = undefined;
    this.noticeComponent.clear();
    
    this.apiService.fetch(this.urlInput).subscribe({
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