import { Component, OnInit } from '@angular/core';
import { HelpinhoService, Helpinho } from '../../services/helpinho.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Auth } from 'aws-amplify';
import { ToastrService } from 'ngx-toastr';

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
  isLoading = true;

  donationAmount: number = 0;
  donationMessage: string = '';

  constructor(
    private route: ActivatedRoute,
    private helpinhoService: HelpinhoService,
    private router: Router,
    private toastr: ToastrService
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
    this.isLoading = true;
    this.helpinhoService.getHelpinhoById(this.helpinhoId).subscribe(
      (data: Helpinho) => {
        this.helpinho = data;
        this.isLoading = false;
        this.checkIfUserIsCreator();
      },
      (error) => {
        console.error('Erro ao carregar o helpinho', error);
        this.isLoading = false;
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

    this.isLoading = true;

    if (this.isFollowing) {
      this.helpinhoService.unfollowHelpinho(this.helpinhoId).subscribe(
        () => {
          this.isFollowing = false;
          this.isLoading = false;
        },
        (error) => {
          console.error('Erro ao deixar de seguir', error);
          this.isLoading = false;
        }
      );
    } else {
      this.helpinhoService.followHelpinho(this.helpinhoId).subscribe(
        () => {
          this.isFollowing = true;
          this.isLoading = false;
        },
        (error) => {
          console.error('Erro ao seguir', error);
          this.isLoading = false;
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
          this.donationAmount = 0;
          this.loadHelpinho();
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
      this.isLoading = true;
      this.helpinhoService.updateHelpinho(this.helpinho).subscribe(
        () => {
          this.toastr.success('Helpinho atualizado com sucesso!');
          this.editMode = false;
          this.isLoading = false;
        },
        (error) => {
          console.error('Erro ao atualizar helpinho', error);
          this.toastr.error('Erro ao atualizar helpinho.');
          this.isLoading = false;
        }
      );
    }
  }

  deleteHelpinho() {
    if (confirm('Você tem certeza que deseja deletar este helpinho?')) {
      this.isLoading = true;
      this.helpinhoService.deleteHelpinho(this.helpinho.id).subscribe(
        () => {
          this.toastr.success('Helpinho deletado com sucesso!', 'Sucesso');
          this.router.navigate(['/']);
          this.isLoading = false;
        },
        (error: any) => {
          console.error('Erro ao deletar o Helpinho:', error);
          this.toastr.error('Ocorreu um erro ao deletar o Helpinho.', 'Erro');
          this.isLoading = false;
        }
      );
    }
  }

}
