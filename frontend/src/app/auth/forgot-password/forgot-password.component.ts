
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

  constructor(private router: Router) {}

  async sendCode() {
    try {
      await Auth.forgotPassword(this.email);
      this.step = 'reset';
      this.successMessage = 'Código enviado para o seu email.';
    } catch (error: any) {
      console.error('Erro ao enviar o código', error);
      this.errorMessage = error.message || 'Erro ao enviar o código.';
    }
  }

  async resetPassword() {
    try {
      await Auth.forgotPasswordSubmit(this.email, this.code, this.newPassword);
      this.successMessage = 'Senha redefinida com sucesso!';
      this.errorMessage = '';
      this.router.navigate(['/login']);
    } catch (error: any) {
      console.error('Erro ao redefinir a senha', error);
      this.errorMessage = error.message || 'Erro ao redefinir a senha.';
    }
  }
}
