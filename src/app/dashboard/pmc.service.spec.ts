import { TestBed } from '@angular/core/testing';

import { PmcService } from './pmc.service';

describe('PmcService', () => {
  let service: PmcService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PmcService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
