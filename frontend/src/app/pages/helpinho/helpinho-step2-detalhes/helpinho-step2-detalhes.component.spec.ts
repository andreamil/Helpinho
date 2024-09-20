import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HelpinhoStep2DetalhesComponent } from './helpinho-step2-detalhes.component';

describe('HelpinhoStep2DetalhesComponent', () => {
  let component: HelpinhoStep2DetalhesComponent;
  let fixture: ComponentFixture<HelpinhoStep2DetalhesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HelpinhoStep2DetalhesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HelpinhoStep2DetalhesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
