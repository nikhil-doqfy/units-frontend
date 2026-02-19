import { TestBed } from '@angular/core/testing';

import { NewTenantFromService } from './new-tenant-from.service';

describe('NewTenantFromService', () => {
  let service: NewTenantFromService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NewTenantFromService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
