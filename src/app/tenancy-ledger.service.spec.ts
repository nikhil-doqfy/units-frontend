import { TestBed } from '@angular/core/testing';

import { TenancyLedgerService } from './tenancy-ledger.service';

describe('TenancyLedgerService', () => {
  let service: TenancyLedgerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TenancyLedgerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
