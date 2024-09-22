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
  trackingCount: number = 0;
  createdCount: number = 0;
  helpinhosAjudados: number = 0;
  isLoadingUserStats: boolean = true;
  isLoadingHelpinhos: boolean = true;
  isLoadingFollowedHelpinhos: boolean = true;

  originalPhoto: string | null = null;

  constructor(private helpinhoService: HelpinhoService) {}

  async ngOnInit(): Promise<void> {
    await this.loadUserData();
    this.loadHelpinhos();
    this.loadUserStatistics();
  }

  async loadUserData(): Promise<void> {
    try {
      const user = await Auth.currentAuthenticatedUser();
      this.originalPhoto = user.attributes.picture || '';

      let birthdate = user.attributes.birthdate;
      if (birthdate && /^\d{4}-\d{2}-\d{2}$/.test(birthdate)) {
        const [year, month, day] = birthdate.split('-');
        birthdate = `${day}/${month}/${year}`;
      }

      let phone = user.attributes.phone_number;
      if (phone && phone.startsWith('+55') && phone.length === 14) {
        phone = `(${phone.slice(3, 5)}) ${phone.slice(5, 11)}-${phone.slice(11)}`;
      }

      this.user = {
        id: user.attributes.sub,
        name: user.attributes.name,
        email: user.attributes.email,
        cpf: user.attributes['custom:cpf'] || '',
        phone: phone || '',
        birthdate: birthdate || '',
        photo: this.originalPhoto
      };

      this.applyCpfMask();
      this.applyPhoneMask();
      this.applyDobMask();

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

      if (this.user.photo !== this.originalPhoto) {
        await this.uploadUserPhoto(this.user.photo);
      }

      await Auth.updateUserAttributes(await Auth.currentAuthenticatedUser(), updatedAttributes);

      window.location.reload()

      this.editMode = false;
    } catch (error) {
      console.error('Erro ao salvar as informações:', error);
      alert('Ocorreu um erro ao salvar as informações. Tente novamente.');
    }
  }

  applyCpfMask() {
    this.user.cpf = this.user.cpf.replace(/\D/g, '');
    if (this.user.cpf.length > 3) this.user.cpf = this.user.cpf.replace(/(\d{3})(\d)/, '$1.$2');
    if (this.user.cpf.length > 7) this.user.cpf = this.user.cpf.replace(/(\d{3})(\d)/, '$1.$2');
    if (this.user.cpf.length > 11) this.user.cpf = this.user.cpf.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  }

  applyPhoneMask() {
    this.user.phone = this.user.phone.replace(/\D/g, '');
    if (this.user.phone.length > 2) this.user.phone = `(${this.user.phone.slice(0, 2)}) ${this.user.phone.slice(2)}`;
    if (this.user.phone.length > 9) this.user.phone = this.user.phone.replace(/(\d{5})(\d{1,4})/, '$1-$2');
  }

  applyDobMask() {
    this.user.birthdate = this.user.birthdate.replace(/\D/g, '');
    if (this.user.birthdate.length > 2) this.user.birthdate = this.user.birthdate.replace(/(\d{2})(\d)/, '$1/$2');
    if (this.user.birthdate.length > 5) this.user.birthdate = this.user.birthdate.replace(/(\d{2})(\d)/, '$1/$2');
  }

  formatDateForAmplify(date: string): string {
    const [day, month, year] = date.split('/');
    return `${year}-${month}-${day}`;
  }

  loadHelpinhos(): void {
    this.helpinhoService.getCreatedHelpinhos().subscribe(
      (data) => {
        this.createdHelpinhos = data.items;
        this.isLoadingHelpinhos = false;
      },
      (error) => {
        console.error('Erro ao carregar helpinhos criados:', error);
        this.isLoadingHelpinhos = false;
      }
    );

    this.helpinhoService.getFollowedHelpinhos().subscribe(
      (data) => {
        this.followedHelpinhos = data.items;
        this.isLoadingFollowedHelpinhos = false;
      },
      (error) => {
        console.error('Erro ao carregar helpinhos seguidos:', error);
        this.isLoadingFollowedHelpinhos = false;
      }
    );
  }

  loadUserStatistics(): void {
    this.helpinhoService.getUserStatistics(this.user.id).subscribe(
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

  async uploadUserPhoto(photoBase64: string): Promise<void> {
    try{
      let response = await this.helpinhoService.uploadUserPhoto({ photoBase64 })
      if (response.photoUrl) {
        this.originalPhoto = response.photoUrl;
        this.user.photo = response.photoUrl;
      }
    }catch{
      alert('Erro ao atualizar a foto do usuário.');
    }
  }
}
