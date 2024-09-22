import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from 'aws-amplify';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  isLoggedIn = false;
  userName: string | null = null;
  userEmail: string | null = null;
  userAvatar: string = 'assets/user-avatar.png';
  isGoogleLogin = false;

  constructor(private router: Router) { }

  ngOnInit(): void {
    this.checkUserLoginState();
  }

  async checkUserLoginState(): Promise<void> {
    try {
      const user = await Auth.currentAuthenticatedUser();
      console.log(user)
      this.isLoggedIn = true;
      this.userName = user.attributes.name;
      this.userEmail = user.attributes.email;

      this.userAvatar = user.attributes.picture || 'assets/user-avatar.png';

      if (user?.attributes?.identities) {
        const provider = JSON.parse(user.attributes.identities)[0].providerName;
        this.isGoogleLogin = provider === 'Google' || provider === 'google'
      }
    } catch (error) {
      this.isLoggedIn = false;
      this.userName = null;
    }
  }

  async logout(): Promise<void> {
    try {
      await Auth.signOut();

      this.isLoggedIn = false;
      this.userName = null;

      if (!this.isGoogleLogin) {
        window.location.reload();
      }
    } catch (error) {
      console.error('Error during logout', error);
    }
  }
}
