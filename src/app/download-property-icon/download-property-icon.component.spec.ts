import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DownloadPropertyIconComponent } from './download-property-icon.component';

describe('DownloadPropertyIconComponent', () => {
  let component: DownloadPropertyIconComponent;
  let fixture: ComponentFixture<DownloadPropertyIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DownloadPropertyIconComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DownloadPropertyIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
