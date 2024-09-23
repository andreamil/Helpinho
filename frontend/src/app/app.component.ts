import { Component, OnInit } from '@angular/core';
import { Auth } from 'aws-amplify';
import { NavigationEnd, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title: any = 'frontend';

  constructor(private router: Router, private toastr: ToastrService) {}

  async ngOnInit() {
    this.router.events.subscribe((event) => {
        if (!(event instanceof NavigationEnd)) {
            return;
        }
        window.scrollTo(0, 0)
    });

    try {
      const user = await Auth.currentAuthenticatedUser();
      if (user?.attributes) {
          const cpf = user.attributes['custom:cpf'];
          const birthdate = user.attributes['birthdate'];

          if (!cpf || !birthdate) {
            this.router.navigate(['/register']);
          }
      }
    } catch (error: any ) {
      console.log('Erro ao verificar o usuário logado', error);
      //this.toastr.error('Erro ao verificar o usuário logado', error.message);
    }
  }
}
