import { CommonModule } from "@angular/common";
import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, OnChanges, SimpleChanges } from "@angular/core";

@Component({
  selector: 'app-scheduled-exec',
  imports: [CommonModule],
  templateUrl: './scheduled-exec.component.html'
})
export class ScheduledExcecComponent implements OnInit, OnDestroy, OnChanges {
    @Input() sec:number = 1;
    @Input() run:boolean = false;
    @Output() exec = new EventEmitter<any>();

    private intervalId?: number;

    ngOnInit() {
        if (this.run) {
            this.startTimer();
        }
    }

    ngOnDestroy() {
        this.stopTimer();
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['run']) {
            if (this.run) {
                this.startTimer();
            } else {
                this.stopTimer();
            }
        }
        if (changes['sec'] && this.run) {
            this.stopTimer();
            this.startTimer();
        }
    }

    private startTimer() {
        this.stopTimer();
        this.intervalId = window.setInterval(() => {
            this.exec.emit();
        }, this.sec * 1000);
    }

    private stopTimer() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = undefined;
        }
    }
}