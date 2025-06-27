import { Component, Input, ChangeDetectorRef, TemplateRef } from '@angular/core';
import { Router, NavigationEnd, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-site-header',
  imports: [CommonModule, RouterLink],
  templateUrl: './site-header.component.html'
})
export class SiteHeaderComponent {
  @Input() siteTitle: string = 'Site-Title';
  @Input() menuButton = [
    {routerLink:'button', label: 'Button'},
    {routerLink:'button', label: 'Button'},
    {routerLink:'button', label: 'Button'},
  ];
  activeRoute: string = '';
  isOpenSideMenu: boolean = false;

  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.activeRoute = event.urlAfterRedirects;
        this.cdr.detectChanges();
      }
    });
  }
}