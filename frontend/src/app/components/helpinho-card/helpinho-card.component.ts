import { Component, Input } from '@angular/core';
import { Helpinho } from '../../services/helpinho.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-helpinho-card',
  templateUrl: './helpinho-card.component.html',
  styleUrls: ['./helpinho-card.component.scss']
})
export class HelpinhoCardComponent {
  @Input()
  helpinho!: Helpinho;

  @Input()
  isSmallCard: boolean = false;
  constructor(private router: Router) {}

  goToHelpinho(id: string): void {
    this.router.navigate(['/helpinho', id]);
  }
}
