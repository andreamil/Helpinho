import { Component, OnInit } from '@angular/core';
import { HelpinhoService, Helpinho } from '../../services/helpinho.service';
import { ActivatedRoute } from '@angular/router';
import { Auth } from 'aws-amplify';

@Component({
  selector: 'app-helpinho',
  templateUrl: './helpinho.component.html',
  styleUrls: ['./helpinho.component.scss'],
})
export class HelpinhoComponent implements OnInit {
  helpinhoId: string = '';
  helpinho!: Helpinho;
  isFollowing = false;
  isLoggedIn = false;
  isCreator = false;
  editMode = false;

  donationAmount: number = 0;
  donationMessage: string = '';

  constructor(
    private route: ActivatedRoute,
    private helpinhoService: HelpinhoService
  ) {}

  ngOnInit(): void {
    this.helpinhoId = this.route.snapshot.paramMap.get('id') || '';
    this.checkUserLoginState();
    this.loadHelpinho();
  }

  async checkUserLoginState(): Promise<void> {
    try {
      const user = await Auth.currentAuthenticatedUser();
      this.isLoggedIn = true;
      this.checkIfFollowing();
    } catch (error) {
      this.isLoggedIn = false;
    }
  }

  loadHelpinho(): void {
    this.helpinhoService.getHelpinhoById(this.helpinhoId).subscribe(
      (data: Helpinho) => {
        this.helpinho = data;
        this.checkIfUserIsCreator();
      },
      (error) => {
        console.error('Erro ao carregar o helpinho', error);
      }
    );
  }

  checkIfUserIsCreator(): void {

    Auth.currentAuthenticatedUser().then((user) => {
      this.isCreator = this.helpinho.userId === user.attributes.sub;
    });
  }

  toggleFollow(): void {
    if (!this.isLoggedIn) {
      alert('Por favor, faça login para seguir este helpinho.');
      return;
    }

    if (this.isFollowing) {
      this.helpinhoService.unfollowHelpinho(this.helpinhoId).subscribe(
        () => {
          this.isFollowing = false;
        },
        (error) => {
          console.error('Erro ao deixar de seguir', error);
        }
      );
    } else {
      this.helpinhoService.followHelpinho(this.helpinhoId).subscribe(
        () => {
          this.isFollowing = true;
        },
        (error) => {
          console.error('Erro ao seguir', error);
        }
      );
    }
  }

  toggleEditMode(): void {
    this.editMode = !this.editMode;
  }
  makeDonation(): void {
    if (!this.isLoggedIn) {
      alert('Por favor, faça login para fazer uma doação.');
      return;
    }

    if (this.donationAmount <= 0) {
      this.donationMessage = 'Por favor, insira um valor válido para a doação.';
      return;
    }

    this.helpinhoService
      .donateToHelpinho(this.helpinhoId, this.donationAmount)
      .subscribe(
        (response) => {
          this.donationMessage = 'Doação realizada com sucesso!';
          this.helpinho.receivedAmount += this.donationAmount;
          this.donationAmount = 0;
        },
        (error) => {
          console.error('Erro ao fazer a doação', error);
          this.donationMessage =
            'Ocorreu um erro ao processar a doação. Tente novamente.';
        }
      );
  }

  checkIfFollowing(): void {
    this.helpinhoService.getFollowedHelpinhos().subscribe(
      (response) => {
        const followedHelpinhos = response.items;
        this.isFollowing = followedHelpinhos.some(
          (h: Helpinho) => h.id === this.helpinhoId
        );
      },
      (error) => {
        console.error('Erro ao verificar se está seguindo', error);
      }
    );
  }

  saveHelpinho(): void {
    if (this.isCreator) {
      this.helpinhoService.updateHelpinho(this.helpinho).subscribe(
        () => {
          alert('Helpinho atualizado com sucesso!');
          this.editMode = false;
        },
        (error) => {
          console.error('Erro ao atualizar helpinho', error);
          alert('Erro ao atualizar helpinho.');
        }
      );
    }
  }
}
