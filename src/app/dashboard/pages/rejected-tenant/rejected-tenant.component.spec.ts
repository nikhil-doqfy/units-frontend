import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RejectedTenantComponent } from './rejected-tenant.component';

describe('RejectedTenantComponent', () => {
  let component: RejectedTenantComponent;
  let fixture: ComponentFixture<RejectedTenantComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RejectedTenantComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RejectedTenantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
