import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SendNegotiationComponent } from './send-negotiation.component';

describe('SendNegotiationComponent', () => {
  let component: SendNegotiationComponent;
  let fixture: ComponentFixture<SendNegotiationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SendNegotiationComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SendNegotiationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
