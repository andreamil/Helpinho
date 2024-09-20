import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FollowedHelpinhosComponent } from './followed-helpinhos.component';

describe('FollowedHelpinhosComponent', () => {
  let component: FollowedHelpinhosComponent;
  let fixture: ComponentFixture<FollowedHelpinhosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FollowedHelpinhosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FollowedHelpinhosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
