import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-helpinho-step3-meta',
  templateUrl: './helpinho-step3-meta.component.html',
  styleUrls: ['./helpinho-step3-meta.component.scss']
})
export class HelpinhoStep3MetaComponent {
  @Input() goal: number = 0;
  @Input() customGoal: number | null = null;
  @Input() deadline: any;

  // Adicionando os dados bancários
  @Input() bankInfo: { accountNumber: string; agency: string; bankName: string } = {
    accountNumber: '',
    agency: '',
    bankName: ''
  };

  @Input() showGoalError: boolean = false;
  @Input() showDeadlineError: boolean = false;

  @Output() goalChange = new EventEmitter<number>();
  @Output() customGoalChange = new EventEmitter<number | null>();
  @Output() deadlineChange = new EventEmitter<string>();
  @Output() bankInfoChange = new EventEmitter<any>();

  selectGoal(value: number) {
    this.goal = value;
    this.customGoal = null;
    this.goalChange.emit(this.goal);
  }

  updateCustomGoal() {
    if (this.customGoal !== null && this.customGoal > 0) {
      this.goal = this.customGoal;
      this.goalChange.emit(this.goal);
    }
  }

  updateDeadline(event: any) {
    this.deadlineChange.emit(event.target.value);
  }

  updateBankInfo() {
    this.bankInfoChange.emit(this.bankInfo);
  }
}
