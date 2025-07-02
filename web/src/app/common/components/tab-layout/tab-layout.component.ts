import { Component, Input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

export interface TabItem {
  routerLink: string;
  label: string;
}

@Component({
  selector: 'app-tab-layout',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './tab-layout.component.html'
})
export class TabLayoutComponent {
  @Input() tabs: TabItem[] = [];
}