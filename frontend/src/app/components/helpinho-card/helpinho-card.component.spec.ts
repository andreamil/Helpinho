import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HelpinhoCardComponent } from './helpinho-card.component';

describe('HelpinhoCardComponent', () => {
  let component: HelpinhoCardComponent;
  let fixture: ComponentFixture<HelpinhoCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HelpinhoCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HelpinhoCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
