import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CircularCrossBtnIconComponent } from './circular-cross-btn-icon.component';

describe('CircularCrossBtnIconComponent', () => {
  let component: CircularCrossBtnIconComponent;
  let fixture: ComponentFixture<CircularCrossBtnIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CircularCrossBtnIconComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CircularCrossBtnIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
