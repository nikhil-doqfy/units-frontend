import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivityHistoryFormComponent } from './activity-history-form.component';

describe('ActivityHistoryFormComponent', () => {
  let component: ActivityHistoryFormComponent;
  let fixture: ComponentFixture<ActivityHistoryFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActivityHistoryFormComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ActivityHistoryFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
