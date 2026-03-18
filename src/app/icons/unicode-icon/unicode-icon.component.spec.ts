import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnicodeIconComponent } from './unicode-icon.component';

describe('UnicodeIconComponent', () => {
  let component: UnicodeIconComponent;
  let fixture: ComponentFixture<UnicodeIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UnicodeIconComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UnicodeIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
