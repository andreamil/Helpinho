import { Component } from '@angular/core';
import { Auth } from 'aws-amplify';
import { CognitoHostedUIIdentityProvider } from '@aws-amplify/auth';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  email: string = '';
  password: string = '';
rememberMe: any;

  constructor(private router: Router, private toastr: ToastrService) {}

  async login() {
    try {
      const user = await Auth.signIn(this.email, this.password);
      console.log('Login successful', user);
      this.router.navigate(['/']);
    } catch (error: any) {
      console.error('Error signing in', error);
      this.toastr.error('Error signing in', error.message);
    }
  }

  async loginWithGoogle() {
    try {
      const user : any = await Auth.federatedSignIn({
        provider: CognitoHostedUIIdentityProvider.Google,
      });
    } catch (error: any) {
      console.error('Error with Google sign in', error);
      this.toastr.error('Error with Google sign in', error.message);
    }
  }
}
