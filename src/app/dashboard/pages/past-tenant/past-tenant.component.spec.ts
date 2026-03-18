import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PastTenantComponent } from './past-tenant.component';

describe('PastTenantComponent', () => {
  let component: PastTenantComponent;
  let fixture: ComponentFixture<PastTenantComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PastTenantComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PastTenantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
