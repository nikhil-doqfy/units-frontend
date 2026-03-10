import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WhatsappShareIconComponent } from './whatsapp-share-icon.component';

describe('WhatsappShareIconComponent', () => {
  let component: WhatsappShareIconComponent;
  let fixture: ComponentFixture<WhatsappShareIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WhatsappShareIconComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WhatsappShareIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
