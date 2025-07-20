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
    @Input() accordion?:boolean;
    
    isExpanded:boolean = false;
    
    ngOnInit() {
        if (this.accordion !== undefined) {
            this.isExpanded = this.accordion;
        }
    }
    
    toggleExpanded() {
        if (this.accordion !== undefined) {
            this.isExpanded = !this.isExpanded;
        }
    }
    
    get isAccordionMode(): boolean {
        return this.accordion !== undefined;
    }
}