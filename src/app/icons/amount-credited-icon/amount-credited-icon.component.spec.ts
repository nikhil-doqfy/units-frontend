import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AmountCreditedIconComponent } from './amount-credited-icon.component';

describe('AmountCreditedIconComponent', () => {
  let component: AmountCreditedIconComponent;
  let fixture: ComponentFixture<AmountCreditedIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AmountCreditedIconComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AmountCreditedIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
