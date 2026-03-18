import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReceiptIconComponent } from './receipt-icon.component';

describe('ReceiptIconComponent', () => {
  let component: ReceiptIconComponent;
  let fixture: ComponentFixture<ReceiptIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReceiptIconComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ReceiptIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
