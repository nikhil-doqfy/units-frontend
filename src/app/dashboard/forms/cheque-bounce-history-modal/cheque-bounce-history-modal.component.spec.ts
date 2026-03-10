import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChequeBounceHistoryModalComponent } from './cheque-bounce-history-modal.component';

describe('ChequeBounceHistoryModalComponent', () => {
  let component: ChequeBounceHistoryModalComponent;
  let fixture: ComponentFixture<ChequeBounceHistoryModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChequeBounceHistoryModalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ChequeBounceHistoryModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
