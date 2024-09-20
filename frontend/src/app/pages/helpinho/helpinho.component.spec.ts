import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HelpinhoComponent } from './helpinho.component';

describe('HelpinhoComponent', () => {
  let component: HelpinhoComponent;
  let fixture: ComponentFixture<HelpinhoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HelpinhoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HelpinhoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
