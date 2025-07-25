import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

const TYPE_ERROR: string = "error";
const TYPE_WARN: string = "warn";
const TYPE_INFO: string = "info";
const TYPE_SUCCESS: string = "success";

export interface NoticeData {
  type: string;
  code?: number | string;
  message: string;
}

@Component({
  selector: 'app-notification',
  imports: [CommonModule],
  templateUrl: './notification.component.html',
  standalone: true
})
export class NotificationComponent {
  @Input() data?:NoticeData;
  
  constructor(private sanitizer: DomSanitizer) {}
  
  get containerClass(): string {
    const baseClass = 'p-3 rounded border flex items-center gap-2';
    
    switch (this.data?.type) {
      case TYPE_ERROR:
        return `${baseClass} bg-red-100 text-red-700 border-red-300`;
      case TYPE_WARN:
        return `${baseClass} bg-yellow-100 text-yellow-700 border-yellow-300`;
      case TYPE_INFO:
        return `${baseClass} bg-blue-100 text-blue-700 border-blue-300`;
      case TYPE_SUCCESS:
        return `${baseClass} bg-green-100 text-green-700 border-green-300`;
      default:
        return `${baseClass} bg-gray-100 text-gray-700 border-gray-300`;
    }
  }
  
  get displayCode(): string {
    return this.data?.code ? `${this.data.code} : ` : '';
  }
  
  get iconSvg(): SafeHtml {
    let svgString = '';
    switch (this.data?.type) {
      case TYPE_ERROR:
        svgString = `
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
        </svg>`;
        break;
      case TYPE_WARN:
        svgString = `
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
        </svg>`;
        break;
      case TYPE_INFO:
        svgString = `
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
        </svg>`;
        break;
      case TYPE_SUCCESS:
        svgString = `
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
        </svg>`;
        break;
      default:
        svgString = '';
    }
    return this.sanitizer.bypassSecurityTrustHtml(svgString);
  }

  public setNoticeError(code:string|number, message:string) {
    this.data = {
        type: TYPE_ERROR,
        code: code,
        message: message
    };
  }

  public setNoticeWarn(message:string, code?:string|number) {
    this.data = {
        type: TYPE_WARN,
        code: code,
        message: message
    };
  }

  public setNoticeInfo(message:string, code?:string|number) {
    this.data = {
        type: TYPE_INFO,
        code: code,
        message: message
    };
  }

  public setNoticeSuccess(message:string, code?:string|number) {
    this.data = {
        type: TYPE_SUCCESS,
        code: code,
        message: message
    };
  }

  public clear() {
    this.data = undefined;
  }
}