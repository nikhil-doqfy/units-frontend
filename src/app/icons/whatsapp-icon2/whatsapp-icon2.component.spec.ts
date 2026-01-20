import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WhatsappIcon2Component } from './whatsapp-icon2.component';

describe('WhatsappIcon2Component', () => {
  let component: WhatsappIcon2Component;
  let fixture: ComponentFixture<WhatsappIcon2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WhatsappIcon2Component]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WhatsappIcon2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
