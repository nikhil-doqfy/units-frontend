import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AmountFailedIconComponent } from './amount-failed-icon.component';

describe('AmountFailedIconComponent', () => {
  let component: AmountFailedIconComponent;
  let fixture: ComponentFixture<AmountFailedIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AmountFailedIconComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AmountFailedIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
