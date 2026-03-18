import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddRentalaccountComponent } from './add-rentalaccount.component';

describe('AddRentalaccountComponent', () => {
  let component: AddRentalaccountComponent;
  let fixture: ComponentFixture<AddRentalaccountComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddRentalaccountComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddRentalaccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
