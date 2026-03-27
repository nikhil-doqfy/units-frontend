import { TestBed } from '@angular/core/testing';

import { ContactSearchService } from './contact-search.service';

describe('ContactSearchService', () => {
  let service: ContactSearchService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ContactSearchService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
