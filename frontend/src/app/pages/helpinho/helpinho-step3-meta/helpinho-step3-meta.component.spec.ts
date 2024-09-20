import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HelpinhoStep3MetaComponent } from './helpinho-step3-meta.component';

describe('HelpinhoStep3MetaComponent', () => {
  let component: HelpinhoStep3MetaComponent;
  let fixture: ComponentFixture<HelpinhoStep3MetaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HelpinhoStep3MetaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HelpinhoStep3MetaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
