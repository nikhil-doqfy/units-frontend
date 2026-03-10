import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PropertySharePlatfromComponent } from './property-share-platfrom.component';

describe('PropertySharePlatfromComponent', () => {
  let component: PropertySharePlatfromComponent;
  let fixture: ComponentFixture<PropertySharePlatfromComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PropertySharePlatfromComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PropertySharePlatfromComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
