import { TestBed } from '@angular/core/testing';

import { DocumenattionService } from './documenattion.service';

describe('DocumenattionService', () => {
  let service: DocumenattionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DocumenattionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
