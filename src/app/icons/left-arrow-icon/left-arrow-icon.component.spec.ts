import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeftArrowIconComponent } from './left-arrow-icon.component';

describe('LeftArrowIconComponent', () => {
  let component: LeftArrowIconComponent;
  let fixture: ComponentFixture<LeftArrowIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LeftArrowIconComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LeftArrowIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
