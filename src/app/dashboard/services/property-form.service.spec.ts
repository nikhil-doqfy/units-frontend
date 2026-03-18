import { TestBed } from '@angular/core/testing';

import { PropertyFormService } from './property-form.service';

describe('PropertyFormService', () => {
  let service: PropertyFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PropertyFormService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
