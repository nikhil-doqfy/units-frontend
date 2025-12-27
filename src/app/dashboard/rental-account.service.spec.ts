import { TestBed } from '@angular/core/testing';

import { RentalAccountService } from './rental-account.service';

describe('RentalAccountService', () => {
  let service: RentalAccountService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RentalAccountService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
