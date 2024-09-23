import { Component, OnInit } from '@angular/core';
import { HelpinhoService, Helpinho } from '../../services/helpinho.service';

@Component({
  selector: 'app-advanced-search',
  templateUrl: './advanced-search.component.html',
  styleUrls: ['./advanced-search.component.scss']
})
export class AdvancedSearchComponent implements OnInit {
  helpinhos: Helpinho[] = [];
  isLoading: boolean = false;

  filters = {
    category: '',
    goalMin: null,
    goalMax: null,
    deadline: null,
    title: '',
    description: '',
    limit: 30,
    customCategory:''
  };

  sortOrder: string = 'createdAt_desc';

  categories: string[] = [
    'Saúde', 'Educação', 'Meio Ambiente', 'Esportes', 'Cultura',
    'Animais', 'Assistência Social', 'Tecnologia', 'Arte e Cultura'
  ];
  showCustomCategoryInput = false;
  donorsLimit: number = 0;

  onCategoryChange(event: any) {
    if (event.target.value === 'other') {
      this.showCustomCategoryInput = true;
      this.filters.category = '';
    } else {
      this.showCustomCategoryInput = false;
      this.filters.customCategory = '';
    }
  }

  constructor(private helpinhoService: HelpinhoService) {}

  ngOnInit(): void {
    this.search();
  }

  search(): void {
    const searchFilters = {
      ...this.filters,
      category: this.filters.customCategory || this.filters.category
    };
    this.isLoading = true;

    const searchParams = {
      category: this.filters.customCategory || this.filters.category,
      goalMin: this.filters.goalMin,
      goalMax: this.filters.goalMax,
      deadline: this.filters.deadline,
      title: this.filters.title,
      sortOrder: this.sortOrder,
      limit: this.filters.limit || 10
    };

    this.helpinhoService.getHelpinhosWithFilters(searchParams).subscribe(
      (response) => {
        this.helpinhos = response.items;
        this.isLoading = false;
      },
      (error) => {
        console.error('Erro ao buscar helpinhos:', error);
        this.isLoading = false;
      }
    );
  }

}
