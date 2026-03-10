import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvoiceIconComponent } from './invoice-icon.component';

describe('InvoiceIconComponent', () => {
  let component: InvoiceIconComponent;
  let fixture: ComponentFixture<InvoiceIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InvoiceIconComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(InvoiceIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
