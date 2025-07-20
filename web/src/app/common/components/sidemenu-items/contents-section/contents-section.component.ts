import { CommonModule } from "@angular/common";
import { Component, Input } from "@angular/core";

@Component({
  selector: 'sidemenu-contents-section',
  imports: [CommonModule],
  templateUrl: './contents-section.component.html'
})
export class ContentsSectionComponent {
    @Input() title?:string;
    @Input() type:'flex' | 'grid' = 'flex';
    @Input() col:number = 1;
}