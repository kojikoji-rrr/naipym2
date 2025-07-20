import { Component, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-local-tabs',
  imports: [CommonModule],
  templateUrl: './local-tabs.component.html'
})
export class LocalTabsComponent implements AfterViewInit {
  @ViewChild('tabContentContainer', { static: true }) tabContentContainer!: ElementRef;
  
  activeTabId: string = '';
  tabs: string[] = [];
  tabElements: HTMLElement[] = [];

  ngAfterViewInit() {
    setTimeout(() => {
      this.detectTabElements();
    }, 0);
  }

  private detectTabElements() {
    // ng-contentの中の要素を直接検索
    const contentContainer = this.tabContentContainer.nativeElement;
    const tabElements = Array.from(contentContainer.querySelectorAll('[id]')) as HTMLElement[];
    
    if (tabElements.length > 0) {
      this.tabElements = tabElements;
      this.tabs = tabElements.map((element, index) => element.id || `tab-${index}`);
      this.activeTabId = this.tabs[0] || '';
      this.setActiveTab(this.activeTabId);
    }
  }

  setActiveTab(displayName: string) {
    this.activeTabId = displayName;
    const activeIndex = this.tabs.indexOf(displayName);
    
    this.tabElements.forEach((element, index) => {
      const isActive = index === activeIndex;
      element.style.display = isActive ? 'block' : 'none';
    });
  }

  isActive(tabId: string): boolean {
    return this.activeTabId === tabId;
  }
}