import { AfterViewInit, Component, ElementRef, Signal, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SiteHeaderComponent } from './common/components/site-header/site-header.component';
import { RouterOutlet } from '@angular/router';
import { SideMenuService } from './common/services/side-menu.service'
import { ScrollContainerService } from './common/services/scroll-container.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, SiteHeaderComponent, RouterOutlet],
  templateUrl: './app.component.html'
})
export class AppComponent implements AfterViewInit{
  @ViewChild('scrollContainer') scrollContainer!: ElementRef;

  sideMenuContent: Signal<TemplateRef<any> | null>;

  constructor(
    private sideMenuService: SideMenuService,
    private scrollContainerService: ScrollContainerService
  ) {
    this.sideMenuContent = this.sideMenuService.content;
  }

  ngAfterViewInit(): void {
    this.scrollContainerService.setScrollContainer(this.scrollContainer);
  }
}
