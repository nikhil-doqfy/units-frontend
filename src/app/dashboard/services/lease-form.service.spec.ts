import { TestBed } from '@angular/core/testing';

import { LeaseFormService } from './lease-form.service';

describe('LeaseFormService', () => {
  let service: LeaseFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LeaseFormService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
