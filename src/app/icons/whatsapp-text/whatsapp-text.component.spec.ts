import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WhatsappTextComponent } from './whatsapp-text.component';

describe('WhatsappTextComponent', () => {
  let component: WhatsappTextComponent;
  let fixture: ComponentFixture<WhatsappTextComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WhatsappTextComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WhatsappTextComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
