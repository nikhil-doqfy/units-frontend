import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TenantDocumentUploadComponent } from './tenant-document-upload.component';

describe('TenantDocumentUploadComponent', () => {
  let component: TenantDocumentUploadComponent;
  let fixture: ComponentFixture<TenantDocumentUploadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TenantDocumentUploadComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TenantDocumentUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
