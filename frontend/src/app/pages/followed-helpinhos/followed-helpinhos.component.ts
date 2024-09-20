import { Component, OnInit } from '@angular/core';
import { HelpinhoService, Helpinho } from '../../services/helpinho.service';

@Component({
  selector: 'app-followed-helpinhos',
  templateUrl: './followed-helpinhos.component.html',
})
export class FollowedHelpinhosComponent implements OnInit {
  helpinhos: Helpinho[] = [];

  constructor(private helpinhoService: HelpinhoService) {}

  ngOnInit(): void {
    this.loadFollowedHelpinhos();
  }

  loadFollowedHelpinhos(): void {
    this.helpinhoService.getFollowedHelpinhos().subscribe(
      (response) => {
        this.helpinhos = response.items;
      },
      (error) => {
        console.error('Erro ao carregar helpinhos seguidos', error);
      }
    );
  }
}
