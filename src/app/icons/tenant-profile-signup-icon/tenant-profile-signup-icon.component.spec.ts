import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TenantProfileSignupIconComponent } from './tenant-profile-signup-icon.component';

describe('TenantProfileSignupIconComponent', () => {
  let component: TenantProfileSignupIconComponent;
  let fixture: ComponentFixture<TenantProfileSignupIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TenantProfileSignupIconComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TenantProfileSignupIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
