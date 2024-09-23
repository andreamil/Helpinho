import { Component } from '@angular/core';

@Component({
  selector: 'app-pages',
  template: `
  <div style="display: block;min-width: 412px;">
    <app-header></app-header>
    <router-outlet></router-outlet>
    <app-footer></app-footer>
  <div>
  `,
  styles: [],
})
export class PagesComponent {}
