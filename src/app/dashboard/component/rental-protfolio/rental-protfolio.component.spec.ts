import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RentalProtfolioComponent } from './rental-protfolio.component';

describe('RentalProtfolioComponent', () => {
  let component: RentalProtfolioComponent;
  let fixture: ComponentFixture<RentalProtfolioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RentalProtfolioComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RentalProtfolioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
