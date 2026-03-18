import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConvertLeadToTenentFromComponent } from './convert-lead-to-tenent-from.component';

describe('ConvertLeadToTenentFromComponent', () => {
  let component: ConvertLeadToTenentFromComponent;
  let fixture: ComponentFixture<ConvertLeadToTenentFromComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConvertLeadToTenentFromComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ConvertLeadToTenentFromComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
