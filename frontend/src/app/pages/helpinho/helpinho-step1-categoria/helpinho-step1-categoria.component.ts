
import { Component, EventEmitter, Output, Input } from '@angular/core';

@Component({
  selector: 'app-helpinho-step1-categoria',
  templateUrl: './helpinho-step1-categoria.component.html',
  styleUrls: ['./helpinho-step1-categoria.component.scss']
})
export class HelpinhoStep1CategoriaComponent {
  @Input() category: string = '';
  @Output() categoryChange = new EventEmitter<string>();

  categories = ['Jogos', 'Saúde', 'Música', 'Reforma', 'Emergência', 'Hospitalar'];

  selectCategory(cat: string) {
    this.category = cat;
    this.categoryChange.emit(this.category);
  }
}
