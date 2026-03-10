import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActiveTenantComponent } from './active-tenant.component';

describe('ActiveTenantComponent', () => {
  let component: ActiveTenantComponent;
  let fixture: ComponentFixture<ActiveTenantComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActiveTenantComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ActiveTenantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
