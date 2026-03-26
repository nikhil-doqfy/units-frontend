import { TestBed } from '@angular/core/testing';

import { TermsConditionService } from './terms-condition.service';

describe('TermsConditionService', () => {
  let service: TermsConditionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TermsConditionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
