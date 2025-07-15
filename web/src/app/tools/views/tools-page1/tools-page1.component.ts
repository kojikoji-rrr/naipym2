import { CommonModule } from '@angular/common';
import { AfterViewChecked, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ContentSpinnerComponent } from "../../../common/components/content-spinner/content-spinner.component";
import Prism from 'prismjs';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-markup';
import { PrettyHtmlPipe } from "../../../common/pipes/pretty-html/pretty-html.pipe";
import { ApiService } from '../../../common/services/api.service';

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
  imports: [CommonModule, FormsModule, ContentSpinnerComponent, PrettyHtmlPipe],
  templateUrl: './tools-page1.component.html'
})
export class ToolsPage1Component implements AfterViewChecked{
  urlInput:string = "";
  isLoading:boolean = false;
  result?:SearchResult;

  constructor(public apiService:ApiService) {}
  
  ngAfterViewChecked() {
    Prism.highlightAll();
  }

  search() {
    if (!this.urlInput.trim()) return;
    
    this.isLoading = true;
    this.result = undefined;
    
    this.apiService.fetch(this.urlInput).subscribe({
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