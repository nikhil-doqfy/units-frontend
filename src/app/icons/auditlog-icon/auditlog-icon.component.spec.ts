import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuditlogIconComponent } from './auditlog-icon.component';

describe('AuditlogIconComponent', () => {
  let component: AuditlogIconComponent;
  let fixture: ComponentFixture<AuditlogIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuditlogIconComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AuditlogIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
