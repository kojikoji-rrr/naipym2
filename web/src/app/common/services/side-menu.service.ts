import { Injectable, signal, TemplateRef, WritableSignal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SideMenuService {
  private contentSource: WritableSignal<TemplateRef<any> | null> = signal(null);
  public content = this.contentSource.asReadonly();

  public setContent(template: TemplateRef<any> | null): void {
    this.contentSource.set(template);
  }
  
  public clearContent(): void {
    this.contentSource.set(null);
  }
}
