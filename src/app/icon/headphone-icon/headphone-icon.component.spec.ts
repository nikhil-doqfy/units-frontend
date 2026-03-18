import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeadphoneIconComponent } from './headphone-icon.component';

describe('HeadphoneIconComponent', () => {
  let component: HeadphoneIconComponent;
  let fixture: ComponentFixture<HeadphoneIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeadphoneIconComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(HeadphoneIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
