import { Component, OnInit } from '@angular/core';
import { Auth } from 'aws-amplify';
import { HelpinhoService } from '../../services/helpinho.service';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent implements OnInit {
  user: any = {};
  editMode = false;
  createdHelpinhos: any[] = [];
  followedHelpinhos: any[] = [];
  totalDonated: number = 0;


  constructor(private helpinhoService:HelpinhoService) {}

  async ngOnInit(): Promise<void> {
    await this.loadUserData();
    this.loadHelpinhos();
  }

  async loadUserData(): Promise<void> {
    try {
      const user = await Auth.currentAuthenticatedUser();
      this.user = {
        name: user.attributes.name,
        email: user.attributes.email,
        cpf: user.attributes['custom:cpf'] || '',
        phone: user.attributes.phone_number || '',
        birthdate: user.attributes.birthdate || '',
        photo: user.attributes.picture || ''
      };
    } catch (error) {
      console.error('Erro ao carregar os dados do usuário:', error);
    }
  }

  onPhotoSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.user.photo = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  async saveUserInfo(): Promise<void> {
    try {
      const updatedAttributes = {
        name: this.user.name,
        'custom:cpf': this.user.cpf.replace(/\D/g, ''),
        phone_number: `+55${this.user.phone.replace(/\D/g, '')}`,
        birthdate: this.formatDateForAmplify(this.user.birthdate)
      };

      await Auth.updateUserAttributes(await Auth.currentAuthenticatedUser(), updatedAttributes);
      alert('Informações atualizadas com sucesso!');
      this.editMode = false;
    } catch (error) {
      console.error('Erro ao salvar as informações:', error);
      alert('Ocorreu um erro ao salvar as informações. Tente novamente.');
    }
  }


  formatCpf(): void {
    let cpf = this.user.cpf.replace(/\D/g, '');
    cpf = cpf.replace(/(\d{3})(\d)/, '$1.$2');
    cpf = cpf.replace(/(\d{3})(\d)/, '$1.$2');
    cpf = cpf.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    this.user.cpf = cpf;
  }


  formatPhone(): void {
    let phone = this.user.phone.replace(/\D/g, '');
    phone = phone.replace(/^(\d{2})(\d)/, '($1) $2');
    phone = phone.replace(/(\d{5})(\d)/, '$1-$2');
    this.user.phone = phone;
  }


  formatBirthdate(): void {
    let date = this.user.birthdate.replace(/\D/g, '');
    if (date.length <= 2) {
      this.user.birthdate = date;
    } else if (date.length <= 4) {
      this.user.birthdate = date.replace(/(\d{2})(\d)/, '$1/$2');
    } else {
      this.user.birthdate = date.replace(/(\d{2})(\d{2})(\d)/, '$1/$2/$3');
    }
  }


  formatDateForAmplify(date: string): string {
    const [day, month, year] = date.split('/');
    return `${year}-${month}-${day}`;
  }
  loadHelpinhos(): void {

    this.helpinhoService.getCreatedHelpinhos().subscribe(
      (data) => {
        this.createdHelpinhos = data.items;
      },
      (error) => {
        console.error('Erro ao carregar helpinhos criados:', error);
      }
    );


    this.helpinhoService.getFollowedHelpinhos().subscribe(
      (data) => {
        this.followedHelpinhos = data.items;
      },
      (error) => {
        console.error('Erro ao carregar helpinhos seguidos:', error);
      }
    );


    this.totalDonated = 1000;
  }
}
