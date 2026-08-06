import { TestBed } from '@angular/core/testing';

import { PaymentAndInvoiceService } from './payment-and-invoice.service';

describe('PaymentAndInvoiceService', () => {
  let service: PaymentAndInvoiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PaymentAndInvoiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
