import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FinanceChevronComponent } from './finance-chevron.component';

describe('FinanceChevronComponent', () => {
  let component: FinanceChevronComponent;
  let fixture: ComponentFixture<FinanceChevronComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FinanceChevronComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FinanceChevronComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
