import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommercialdetailsComponent } from './commercialdetails.component';

describe('CommercialdetailsComponent', () => {
  let component: CommercialdetailsComponent;
  let fixture: ComponentFixture<CommercialdetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommercialdetailsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CommercialdetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
