import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from 'aws-amplify';
import { CognitoHostedUIIdentityProvider } from '@aws-amplify/auth';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {

  name: string = '';
  email: string = '';
  cpf: string = '';
  dob: string = '';
  phone: string = '';
  password: string = '';
  isGoogleUser: boolean = false;
  userPhotoUrl: string = 'assets/default-avatar.webp';
  user: any;

  registrationComplete: boolean = false;
  message: string = '';

  constructor(private router: Router, private toastr: ToastrService) {}

  async ngOnInit() {
    try {
      const user = await Auth.currentAuthenticatedUser();
      if (user) this.user = user;

      if (user?.attributes) {
        this.name = user.attributes.name;
        this.email = user.attributes.email;
        this.isGoogleUser = true;
        this.cpf = user.attributes['custom:cpf'];

        const birthdate = user.attributes['birthdate'];
        if (birthdate && /^\d{4}-\d{2}-\d{2}$/.test(birthdate)) {
          const [year, month, day] = birthdate.split('-');
          this.dob = `${day}/${month}/${year}`;
        } else {
          this.dob = birthdate;
        }

        const phone = user.attributes['phone_number'];
        if (phone && phone.startsWith('+55') && phone.length === 14) {
          this.phone = `(${phone.slice(3, 5)}) ${phone.slice(5, 11)}-${phone.slice(11)}`;
        }

        this.userPhotoUrl = user.attributes.picture || 'assets/default-avatar.webp';

        this.applyCpfMask();
        this.applyPhoneMask();
        this.applyDobMask();
      }
    } catch (error) {
      console.error('Erro ao obter usuário autenticado', error);
    }
  }


  applyCpfMask() {
    this.cpf = this.cpf.replace(/\D/g, '');
    if (this.cpf.length > 3) this.cpf = this.cpf.replace(/(\d{3})(\d)/, '$1.$2');
    if (this.cpf.length > 7) this.cpf = this.cpf.replace(/(\d{3})(\d)/, '$1.$2');
    if (this.cpf.length > 11) this.cpf = this.cpf.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  }

  applyPhoneMask() {
    this.phone = this.phone.replace(/\D/g, '');
    if (this.phone.length > 2) this.phone = `(${this.phone.slice(0, 2)}) ${this.phone.slice(2)}`;
    if (this.phone.length > 9) this.phone = this.phone.replace(/(\d{5})(\d{1,4})/, '$1-$2');
  }

  applyDobMask() {
    this.dob = this.dob.replace(/\D/g, '');
    if (this.dob.length > 2) this.dob = this.dob.replace(/(\d{2})(\d)/, '$1/$2');
    if (this.dob.length > 5) this.dob = this.dob.replace(/(\d{2})(\d)/, '$1/$2');
  }

  formatPhoneForStorage() {
    return `+55${this.phone.replace(/\D/g, '')}`;
  }

  formatDobForStorage() {

    const parts = this.dob.split('/');
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }

  formatCpfForStorage() {
    return this.cpf.replace(/\D/g, '');
  }

  async register() {
    try {
      const formattedCpf = this.formatCpfForStorage();
      const formattedPhone = this.formatPhoneForStorage();
      const formattedDob = this.formatDobForStorage();

      if (this.isGoogleUser) {
        const user = await Auth.currentAuthenticatedUser();
        await Auth.updateUserAttributes(user, {
          'custom:cpf': formattedCpf,
          'birthdate': formattedDob,
          'phone_number': formattedPhone
        });

        this.router.navigate(['/']);
      } else {
        await Auth.signUp({
          username: this.email,
          password: this.password,
          attributes: {
            name: this.name,
            email: this.email,
            'custom:cpf': formattedCpf,
            birthdate: formattedDob,
            phone_number: formattedPhone,
            picture: this.userPhotoUrl
          }
        });

        this.registrationComplete = true;
        this.message = 'Registro realizado com sucesso! Verifique seu email para confirmar sua conta antes de fazer login.';
      }
    } catch (error: any) {
      console.error('Erro ao registrar usuário', error);
      this.toastr.error('Erro ao registrar usuário', error.message);
    }
  }

  async registerWithGoogle() {
    try {
      await Auth.federatedSignIn({ provider: CognitoHostedUIIdentityProvider.Google });

      const user = await Auth.currentAuthenticatedUser();

      const cpf = user.attributes['custom:cpf'];
      const birthdate = user.attributes['birthdate'];

      if (!cpf || !birthdate) {
        this.router.navigate(['/register']);
      } else {
        this.router.navigate(['/home']);
      }
    } catch (error: any) {
      console.error('Erro ao fazer login com Google', error);
      this.toastr.error('Erro ao fazer login com Google', error.message);
    }
  }
}
