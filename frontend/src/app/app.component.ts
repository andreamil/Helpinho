import { Component, OnInit } from '@angular/core';
import { Auth } from 'aws-amplify';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  constructor(private router: Router, private toastr: ToastrService) {}

  async ngOnInit() {
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
      console.error('Erro ao verificar o usuário logado', error);
      this.toastr.error('Erro ao verificar o usuário logado', error.message);
    }
  }
}
