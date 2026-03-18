import { TestBed } from '@angular/core/testing';

import { RaiseComplaintService } from './raise-complaint.service';

describe('RaiseComplaintService', () => {
  let service: RaiseComplaintService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RaiseComplaintService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
