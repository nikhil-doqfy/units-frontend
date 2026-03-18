import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TenancyLedgerComponent } from './tenancy-ledger.component';

describe('TenancyLedgerComponent', () => {
  let component: TenancyLedgerComponent;
  let fixture: ComponentFixture<TenancyLedgerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TenancyLedgerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TenancyLedgerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
