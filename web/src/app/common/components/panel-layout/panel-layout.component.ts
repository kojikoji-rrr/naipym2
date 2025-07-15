import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-panel-layout',
  imports: [CommonModule],
  templateUrl: './panel-layout.component.html'
})
export class PanelLayoutComponent {
    @Input() title:string = "";
    @Input() panelClass?:string;
    @Input() panelStyle?:{[key:symbol]:string};
    @Input() contentClass?:string;
    @Input() contentStyle?:{[key:symbol]:string};
}