import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActiveTenantTabComponent } from './active-tenant-tab.component';

describe('ActiveTenantTabComponent', () => {
  let component: ActiveTenantTabComponent;
  let fixture: ComponentFixture<ActiveTenantTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActiveTenantTabComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ActiveTenantTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
