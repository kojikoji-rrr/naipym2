import { Injectable, Input, ComponentRef, ViewContainerRef, ApplicationRef, createComponent, EnvironmentInjector } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { NotificationToastComponent } from '../components/notification-toast/notification-toast.component';

const TYPE_ERROR: string = "error";
const TYPE_WARN: string = "warn";
const TYPE_INFO: string = "info";
const TYPE_SUCCESS: string = "success";

export interface NoticeData {
  type: string;
  code?: number | string;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class NoticeService {
  @Input() data?:NoticeData;
  private toastComponents: ComponentRef<NotificationToastComponent>[] = [];
  
  constructor(
    private sanitizer: DomSanitizer,
    private appRef: ApplicationRef,
    private injector: EnvironmentInjector
  ) {}

  private showToast(data: NoticeData) {
    const componentRef = createComponent(NotificationToastComponent, {
      environmentInjector: this.injector
    });
    
    componentRef.setInput('data', data);
    
    // DOM に追加
    this.appRef.attachView(componentRef.hostView);
    const rootElement = (componentRef.hostView as any).rootNodes[0] as HTMLElement;
    document.body.appendChild(rootElement);
    
    // 管理用配列に追加
    this.toastComponents.push(componentRef);
    
    // 自動削除のタイマー設定
    setTimeout(() => {
      this.removeToast(componentRef);
    }, 5300); // 5秒 + アニメーション時間
  }

  private removeToast(componentRef: ComponentRef<NotificationToastComponent>) {
    const index = this.toastComponents.indexOf(componentRef);
    if (index > -1) {
      this.toastComponents.splice(index, 1);
      this.appRef.detachView(componentRef.hostView);
      componentRef.destroy();
    }
  }

  public setNoticeError(code:string|number, message:string) {
    const data: NoticeData = {
        type: TYPE_ERROR,
        code: code,
        message: message
    };
    this.data = data;
    this.showToast(data);
  }

  public setNoticeWarn(message:string, code?:string|number) {
    const data: NoticeData = {
        type: TYPE_WARN,
        code: code,
        message: message
    };
    this.data = data;
    this.showToast(data);
  }

  public setNoticeInfo(message:string, code?:string|number) {
    const data: NoticeData = {
        type: TYPE_INFO,
        code: code,
        message: message
    };
    this.data = data;
    this.showToast(data);
  }

  public setNoticeSuccess(message:string, code?:string|number) {
    const data: NoticeData = {
        type: TYPE_SUCCESS,
        code: code,
        message: message
    };
    this.data = data;
    this.showToast(data);
  }
}
