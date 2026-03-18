import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewTenantComponent } from './new-tenant.component';

describe('NewTenantComponent', () => {
  let component: NewTenantComponent;
  let fixture: ComponentFixture<NewTenantComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewTenantComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NewTenantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
