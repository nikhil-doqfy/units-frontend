import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AditionalDocumentDownloadIconComponent } from './aditional-document-download-icon.component';

describe('AditionalDocumentDownloadIconComponent', () => {
  let component: AditionalDocumentDownloadIconComponent;
  let fixture: ComponentFixture<AditionalDocumentDownloadIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AditionalDocumentDownloadIconComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AditionalDocumentDownloadIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
