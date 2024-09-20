import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PagesComponent } from './pages.component';
import { HomeComponent } from './home/home.component';
import { HelpinhoComponent } from './helpinho/helpinho.component';
import { FollowedHelpinhosComponent } from './followed-helpinhos/followed-helpinhos.component';

import { AuthGuard } from '../guards/auth.guard';
import { HelpinhoCreationStepperComponent } from './helpinho/helpinho-creation-stepper/helpinho-creation-stepper.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { AdvancedSearchComponent } from './advanced-search/advanced-search.component';

const routes: Routes = [
  {
    path: '',
    component: PagesComponent,
    children: [
      { path: '', component: HomeComponent },
      { path: 'home', component: HomeComponent },
      { path: 'pesquisa', component: AdvancedSearchComponent },
      { path: 'me', component: UserProfileComponent, canActivate: [AuthGuard] },
      {
        path: 'helpinho/create',
        component: HelpinhoCreationStepperComponent,
        canActivate: [AuthGuard],
      },
      { path: 'helpinho/:id', component: HelpinhoComponent },
      {
        path: 'followed-helpinhos',
        component: FollowedHelpinhosComponent,
        canActivate: [AuthGuard],
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PagesRoutingModule {}
