import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CallVoiceSummaryComponent } from './call-voice-summary.component';

describe('CallVoiceSummaryComponent', () => {
  let component: CallVoiceSummaryComponent;
  let fixture: ComponentFixture<CallVoiceSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CallVoiceSummaryComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CallVoiceSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
