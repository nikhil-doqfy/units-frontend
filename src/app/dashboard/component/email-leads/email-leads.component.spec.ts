import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmailLeadsComponent } from './email-leads.component';

describe('EmailLeadsComponent', () => {
  let component: EmailLeadsComponent;
  let fixture: ComponentFixture<EmailLeadsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmailLeadsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EmailLeadsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
