import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RentalPortfolioIconComponent } from './rental-portfolio-icon.component';

describe('RentalPortfolioIconComponent', () => {
  let component: RentalPortfolioIconComponent;
  let fixture: ComponentFixture<RentalPortfolioIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RentalPortfolioIconComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RentalPortfolioIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
