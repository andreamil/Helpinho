import { Component, OnInit, ViewChild } from '@angular/core';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { HelpinhoService, Helpinho } from '../../services/helpinho.service';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { Auth } from 'aws-amplify';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  @ViewChild(CdkVirtualScrollViewport) viewport!: CdkVirtualScrollViewport;

  isLoggedIn = false;
  userName: string | null = null;

  helpinhos: Helpinho[] = [];
  limit = 12;
  lastEvaluatedKey: string | null = null;
  hasMore = true;
  isLoading = false;
  searchTerm = '';
  filters: any = {};
  errorMessage = '';

  trackingCount = 0;
  createdCount = 0;
  totalDonated: string|number = 0;
  helpinhosAjudados: any = 0;

  categories = ['Jogos', 'Saúde', 'Música', 'Reforma', 'Emergência', 'Hospitalar', 'Educação', 'Meio Ambiente', 'Esportes', 'Cultura', 'Animais', 'Assistência Social', 'Tecnologia', 'Arte e Cultura'];

  isLoadingUserStats = true;
  isLoadingHelpinhos = false;

  searchTermChanged: Subject<string> = new Subject<string>();

  constructor(private helpinhoService: HelpinhoService) {
    this.searchTermChanged.pipe(debounceTime(300)).subscribe((term) => {
      this.onSearchChanged(term);
    });
  }

  ngOnInit(): void {
    this.checkUserLoginState();
    this.loadHelpinhos();
  }

  async checkUserLoginState(): Promise<void> {
    try {
      const user = await Auth.currentAuthenticatedUser();
      this.isLoggedIn = true;
      this.userName = user.attributes.name;

      this.loadUserStatistics(user.attributes.sub);

    } catch (error) {
      this.isLoggedIn = false;
      this.userName = null;
      this.isLoadingUserStats = false;
    }
  }

  loadUserStatistics(userId: string): void {
    this.helpinhoService.getUserStatistics(userId).subscribe(
      (response) => {
        this.trackingCount = response.trackingCount;
        this.createdCount = response.createdCount;
        this.totalDonated = response.totalDonated;
        this.helpinhosAjudados = response.helpinhosAjudados;
        this.isLoadingUserStats = false;
      },
      (error) => {
        console.error('Erro ao carregar estatísticas do usuário', error);
        this.isLoadingUserStats = false;
      }
    );
  }

  loadHelpinhos(): void {
    if (this.isLoadingHelpinhos || !this.hasMore) {
      return;
    }

    this.isLoadingHelpinhos = true;
    this.errorMessage = '';

    this.helpinhoService
      .getHelpinhos(
        this.limit,
        this.lastEvaluatedKey,
        this.searchTerm,
        this.filters
      )
      .subscribe(
        (response: any) => {
          const data = response.items;
          this.lastEvaluatedKey = response.lastEvaluatedKey;

          if (!this.lastEvaluatedKey) {
            this.hasMore = false;
          }

          this.helpinhos = [...this.helpinhos, ...data];

          this.isLoadingHelpinhos = false;
          if(this.helpinhos.length < this.limit && this.hasMore){
            this.loadHelpinhos()
          }
        },
        (error) => {
          console.error('Erro ao buscar helpinhos', error);
          this.isLoadingHelpinhos = false;
          this.errorMessage =
            'Erro ao carregar helpinhos. Tente novamente mais tarde.';
        }
      );
  }
  onScroll(): void {
    this.loadHelpinhos();
  }

  onSearch(term: string): void {
    this.searchTermChanged.next(term);
  }

  onSearchChanged(term: string): void {
    this.searchTerm = term.toLowerCase();
    this.resetHelpinhos();
  }

  onFilterChange(event: any): void {
    this.lastEvaluatedKey = null;
    this.filters = { ...this.filters, category: event.target.value };
    this.resetHelpinhos();
  }

  resetHelpinhos(): void {
    this.lastEvaluatedKey = null;
    this.hasMore = true;
    this.helpinhos = [];
    this.loadHelpinhos();
  }
}
