import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RentalIconComponent } from './rental-icon.component';

describe('RentalIconComponent', () => {
  let component: RentalIconComponent;
  let fixture: ComponentFixture<RentalIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RentalIconComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RentalIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
