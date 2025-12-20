import { TestBed } from '@angular/core/testing';

import { RoleAndPermissionsService } from './role-and-permissions.service';

describe('RoleAndPermissionsService', () => {
  let service: RoleAndPermissionsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RoleAndPermissionsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
