import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HelpinhoCreationStepperComponent } from './helpinho-creation-stepper.component';

describe('HelpinhoCreationStepperComponent', () => {
  let component: HelpinhoCreationStepperComponent;
  let fixture: ComponentFixture<HelpinhoCreationStepperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HelpinhoCreationStepperComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HelpinhoCreationStepperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
