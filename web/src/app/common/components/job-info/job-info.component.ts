import { CommonModule } from "@angular/common";
import { Component, Input } from "@angular/core";
import { TimeBadgeComponent } from "../custom-badges/time-badge.component";

@Component({
  selector: 'app-job-info',
  imports: [CommonModule, TimeBadgeComponent],
  templateUrl: './job-info.component.html',
})
export class JobInfoComponent {
    @Input() data?:{[key:string]:any};
    @Input() class:string = "";

    getStatusBudge() {
        if (!this.data) {
            return "";
        }

        switch(this.data['status']){
            case "error":
                return "badge-red";
            case "completed":
                return "badge-green";
            case "running":
                return "badge-yellow";
            case "stopped":
                return "badge-indigo";
            default:
                return "badge-gray";
        }
    }
}