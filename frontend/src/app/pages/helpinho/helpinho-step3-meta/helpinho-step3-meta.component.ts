
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-helpinho-step3-meta',
  templateUrl: './helpinho-step3-meta.component.html',
  styleUrls: ['./helpinho-step3-meta.component.scss']
})
export class HelpinhoStep3MetaComponent {
  @Input() goal: number = 0;
  @Output() goalChange = new EventEmitter<number>();

  selectGoal(value: number) {
    this.goal = value;
    this.goalChange.emit(this.goal);
  }
}
