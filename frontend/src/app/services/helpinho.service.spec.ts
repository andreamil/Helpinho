import { TestBed } from '@angular/core/testing';

import { HelpinhoService } from './helpinho.service';

describe('HelpinhoService', () => {
  let service: HelpinhoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HelpinhoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
