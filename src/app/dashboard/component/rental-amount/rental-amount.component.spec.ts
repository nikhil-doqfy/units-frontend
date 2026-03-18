import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RentalAmountComponent } from './rental-amount.component';

describe('RentalAmountComponent', () => {
  let component: RentalAmountComponent;
  let fixture: ComponentFixture<RentalAmountComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RentalAmountComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RentalAmountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
