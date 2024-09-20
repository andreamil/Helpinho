import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HelpinhoStep4RevisaoComponent } from './helpinho-step4-revisao.component';

describe('HelpinhoStep4RevisaoComponent', () => {
  let component: HelpinhoStep4RevisaoComponent;
  let fixture: ComponentFixture<HelpinhoStep4RevisaoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HelpinhoStep4RevisaoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HelpinhoStep4RevisaoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
