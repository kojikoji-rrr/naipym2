import { CommonModule } from '@angular/common';
import { AfterViewChecked, Component, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ContentSpinnerComponent } from '../../../common/components/content-spinner/content-spinner.component';
import { PrettyHtmlPipe } from '../../../common/pipes/pretty-html/pretty-html.pipe';
import { NumberOnlyDirective } from '../../../common/directives/number-only/number-only.directive';
import { ApiService } from '../../../common/services/api.service';
import Prism from 'prismjs';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-markup';

export interface SearchResult {
  code: number;
  error?:string;
  data?: {
    html: string,
    json: string
  };
}

@Component({
  selector: 'app-tools-page2',
  imports: [CommonModule, FormsModule, ContentSpinnerComponent, PrettyHtmlPipe, NumberOnlyDirective],
  templateUrl: './tools-page2.component.html'
})
export class ToolsPage2Component implements AfterViewChecked {
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
    
    this.apiService.searchDanbooruByArtist(this.strInput, this.pageInput).subscribe({
      next: (response: SearchResult) => {
        this.result = response;
        this.isLoading = false;
      },
      error: (error) => {
        this.result = {
          code: error.status,
          error: error.message
        };
        this.isLoading = false;
      }
    });
  }
}