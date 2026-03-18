import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivityHistroyIconsComponent } from './activity-histroy-icons.component';

describe('ActivityHistroyIconsComponent', () => {
  let component: ActivityHistroyIconsComponent;
  let fixture: ComponentFixture<ActivityHistroyIconsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActivityHistroyIconsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ActivityHistroyIconsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
