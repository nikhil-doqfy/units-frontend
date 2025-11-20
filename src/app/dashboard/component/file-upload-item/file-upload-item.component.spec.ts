import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FileUploadItemComponent } from './file-upload-item.component';

describe('FileUploadItemComponent', () => {
  let component: FileUploadItemComponent;
  let fixture: ComponentFixture<FileUploadItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FileUploadItemComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FileUploadItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
