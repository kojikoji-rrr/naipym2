import { CommonModule } from "@angular/common";
import { Component, Input } from "@angular/core";

@Component({
  selector: 'app-label-one-content',
  host: {'[class]': 'class'},
  imports: [CommonModule],
  templateUrl: './label-one-content.component.html'
})
export class LabelOneContentComponent {
    @Input() label?:string;
    @Input() labelSize:string = "xs";
    @Input() isLabelTop:boolean = false;
    @Input() class:string = "";
}