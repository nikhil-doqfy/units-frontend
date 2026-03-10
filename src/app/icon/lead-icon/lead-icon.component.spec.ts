import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeadIconComponent } from './lead-icon.component';

describe('LeadIconComponent', () => {
  let component: LeadIconComponent;
  let fixture: ComponentFixture<LeadIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LeadIconComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LeadIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
