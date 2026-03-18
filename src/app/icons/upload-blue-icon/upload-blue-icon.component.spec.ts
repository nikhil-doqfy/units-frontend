import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadBlueIconComponent } from './upload-blue-icon.component';

describe('UploadBlueIconComponent', () => {
  let component: UploadBlueIconComponent;
  let fixture: ComponentFixture<UploadBlueIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UploadBlueIconComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UploadBlueIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
