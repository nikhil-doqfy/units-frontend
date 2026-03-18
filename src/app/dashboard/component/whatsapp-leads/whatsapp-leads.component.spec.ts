import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WhatsappLeadsComponent } from './whatsapp-leads.component';

describe('WhatsappLeadsComponent', () => {
  let component: WhatsappLeadsComponent;
  let fixture: ComponentFixture<WhatsappLeadsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WhatsappLeadsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WhatsappLeadsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
