import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PropertyAnalyticsComponent } from './property-analytics.component';

describe('PropertyAnalyticsComponent', () => {
  let component: PropertyAnalyticsComponent;
  let fixture: ComponentFixture<PropertyAnalyticsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PropertyAnalyticsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PropertyAnalyticsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
