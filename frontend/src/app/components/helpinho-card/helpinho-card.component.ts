import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-helpinho-card',
  templateUrl: './helpinho-card.component.html',
  styleUrls: ['./helpinho-card.component.scss']
})
export class HelpinhoCardComponent {
  @Input() helpinho: any;
}
