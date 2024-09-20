import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';


import { RouterModule } from '@angular/router';


import { PagesComponent } from './pages.component';
import { HomeComponent } from './home/home.component';
import { HelpinhoComponent } from './helpinho/helpinho.component';
import { FollowedHelpinhosComponent } from './followed-helpinhos/followed-helpinhos.component';


import { HeaderComponent } from '../components/header/header.component';
import { FooterComponent } from '../components/footer/footer.component';


import { FormsModule } from '@angular/forms';


import { PagesRoutingModule } from './pages-routing.module';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { HelpinhoCardComponent } from '../components/helpinho-card/helpinho-card.component';
import { HelpinhoCreationStepperComponent } from './helpinho/helpinho-creation-stepper/helpinho-creation-stepper.component';
import { HelpinhoStep1CategoriaComponent } from './helpinho/helpinho-step1-categoria/helpinho-step1-categoria.component';
import { HelpinhoStep2DetalhesComponent } from './helpinho/helpinho-step2-detalhes/helpinho-step2-detalhes.component';
import { HelpinhoStep3MetaComponent } from './helpinho/helpinho-step3-meta/helpinho-step3-meta.component';
import { HelpinhoStep4RevisaoComponent } from './helpinho/helpinho-step4-revisao/helpinho-step4-revisao.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { AdvancedSearchComponent } from './advanced-search/advanced-search.component';

@NgModule({
  declarations: [
    PagesComponent,
    HomeComponent,
    HelpinhoComponent,
    FollowedHelpinhosComponent,
    HeaderComponent,
    FooterComponent,
    HelpinhoCardComponent,
    HelpinhoCreationStepperComponent,
    HelpinhoStep1CategoriaComponent,
    HelpinhoStep2DetalhesComponent,
    HelpinhoStep3MetaComponent,
    HelpinhoStep4RevisaoComponent,
    UserProfileComponent,
    AdvancedSearchComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    PagesRoutingModule,
    InfiniteScrollModule
  ],
})
export class PagesModule {}
