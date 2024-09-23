
import { Component } from '@angular/core';
import { Auth } from 'aws-amplify';
import { Router } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
})
export class ForgotPasswordComponent {
  email: string = '';
  code: string = '';
  newPassword: string = '';
  step: 'request' | 'reset' = 'request';
  errorMessage: string = '';
  successMessage: string = '';
  isLoading: boolean = false;

  constructor(private router: Router) {}

  async sendCode() {
    this.isLoading = true;
    try {
      await Auth.forgotPassword(this.email);
      this.isLoading = false;
      this.step = 'reset';
      this.errorMessage = ''
      this.successMessage = 'Código enviado para o seu email.';
    } catch (error: any) {
      console.error('Erro ao enviar o código', error);
      this.errorMessage = error.message || 'Erro ao enviar o código.';
      this.successMessage = '';
      this.isLoading = false;
    }
  }

  async resetPassword() {
    this.isLoading = true;
    try {
      await Auth.forgotPasswordSubmit(this.email, this.code, this.newPassword);
      this.successMessage = 'Senha redefinida com sucesso!';
      this.errorMessage = '';
      this.router.navigate(['/login']);
      this.isLoading = false;
    } catch (error: any) {
      console.error('Erro ao redefinir a senha', error);
      this.errorMessage = error.message || 'Erro ao redefinir a senha.';
      this.successMessage = '';
      this.isLoading = false;
    }
  }
}
