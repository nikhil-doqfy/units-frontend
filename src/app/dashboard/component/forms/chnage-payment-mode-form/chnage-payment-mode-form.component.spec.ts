import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChnagePaymentModeFormComponent } from './chnage-payment-mode-form.component';

describe('ChnagePaymentModeFormComponent', () => {
  let component: ChnagePaymentModeFormComponent;
  let fixture: ComponentFixture<ChnagePaymentModeFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChnagePaymentModeFormComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ChnagePaymentModeFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
