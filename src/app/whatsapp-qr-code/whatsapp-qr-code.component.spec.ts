import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WhatsappQrCodeComponent } from './whatsapp-qr-code.component';

describe('WhatsappQrCodeComponent', () => {
  let component: WhatsappQrCodeComponent;
  let fixture: ComponentFixture<WhatsappQrCodeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WhatsappQrCodeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WhatsappQrCodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
