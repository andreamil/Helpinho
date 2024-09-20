import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HelpinhoStep1CategoriaComponent } from './helpinho-step1-categoria.component';

describe('HelpinhoStep1CategoriaComponent', () => {
  let component: HelpinhoStep1CategoriaComponent;
  let fixture: ComponentFixture<HelpinhoStep1CategoriaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HelpinhoStep1CategoriaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HelpinhoStep1CategoriaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
