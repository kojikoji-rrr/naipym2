import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { NoticeData } from '../../services/notice.service';

@Component({
  selector: 'app-notification-toast',
  imports: [CommonModule],
  templateUrl: './notification-toast.component.html',
  styleUrl: './notification-toast.component.css'
})
export class NotificationToastComponent implements OnInit, OnDestroy {
  @Input() data!: NoticeData;
  @Input() duration: number = 5000; // 5秒でデフォルト
  
  isVisible: boolean = false;
  private timeoutId?: number;

  ngOnInit() {
    // アニメーション用に少し遅らせて表示
    setTimeout(() => {
      this.isVisible = true;
    }, 10);

    // 指定時間後に自動で非表示
    this.timeoutId = window.setTimeout(() => {
      this.hide();
    }, this.duration);
  }

  ngOnDestroy() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
  }

  hide() {
    this.isVisible = false;
    // アニメーション完了後にコンポーネントを削除
    setTimeout(() => {
      // 親コンポーネントで管理されるため、ここでは何もしない
    }, 300);
  }

  getIconSvg(): string {
    switch (this.data.type) {
      case 'error':
        return `<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
        </svg>`;
      case 'warn':
        return `<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
        </svg>`;
      case 'info':
        return `<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
        </svg>`;
      case 'success':
        return `<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
        </svg>`;
      default:
        return '';
    }
  }

  getToastClasses(): string {
    const baseClasses = 'fixed top-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-sm flex items-center p-3 sm:p-4 rounded-lg shadow-lg transition-all duration-300 transform';
    const visibilityClasses = this.isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0';
    
    let colorClasses = '';
    switch (this.data.type) {
      case 'error':
        colorClasses = 'bg-red-50 text-red-800 border border-red-200';
        break;
      case 'warn':
        colorClasses = 'bg-yellow-50 text-yellow-800 border border-yellow-200';
        break;
      case 'info':
        colorClasses = 'bg-blue-50 text-blue-800 border border-blue-200';
        break;
      case 'success':
        colorClasses = 'bg-green-50 text-green-800 border border-green-200';
        break;
      default:
        colorClasses = 'bg-gray-50 text-gray-800 border border-gray-200';
    }
    
    return `${baseClasses} ${visibilityClasses} ${colorClasses}`;
  }

  getIconClasses(): string {
    switch (this.data.type) {
      case 'error':
        return 'text-red-500';
      case 'warn':
        return 'text-yellow-500';
      case 'info':
        return 'text-blue-500';
      case 'success':
        return 'text-green-500';
      default:
        return 'text-gray-500';
    }
  }

  getMessage(): string {
    if (this.data.code !== undefined && this.data.code !== null) {
      return `[${this.data.code}] ${this.data.message}`;
    }
    return this.data.message;
  }

  onToastClick() {
    this.hide();
  }
}