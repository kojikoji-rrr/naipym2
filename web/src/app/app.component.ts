import { Component, Signal, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SiteHeaderComponent } from './common/components/site-header/site-header.component';
import { RouterOutlet } from '@angular/router';
import { SideMenuService } from './common/services/side-menu.service'

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, SiteHeaderComponent, RouterOutlet],
  templateUrl: './app.component.html'
})
export class AppComponent {
  sideMenuContent: Signal<TemplateRef<any> | null>;

  constructor(private sideMenuService: SideMenuService) {
    this.sideMenuContent = this.sideMenuService.content;
  }
}
