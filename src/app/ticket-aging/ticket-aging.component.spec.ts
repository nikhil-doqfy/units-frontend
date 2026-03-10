import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TicketAgingComponent } from './ticket-aging.component';

describe('TicketAgingComponent', () => {
  let component: TicketAgingComponent;
  let fixture: ComponentFixture<TicketAgingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TicketAgingComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TicketAgingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
