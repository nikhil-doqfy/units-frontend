import { TestBed } from '@angular/core/testing';

import { EjarimodelService } from './ejarimodel.service';

describe('EjarimodelService', () => {
  let service: EjarimodelService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EjarimodelService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
