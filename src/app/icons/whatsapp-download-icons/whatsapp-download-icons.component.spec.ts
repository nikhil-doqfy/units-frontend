import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WhatsappDownloadIconsComponent } from './whatsapp-download-icons.component';

describe('WhatsappDownloadIconsComponent', () => {
  let component: WhatsappDownloadIconsComponent;
  let fixture: ComponentFixture<WhatsappDownloadIconsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WhatsappDownloadIconsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WhatsappDownloadIconsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
