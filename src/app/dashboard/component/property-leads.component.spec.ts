import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PropertyLeadsComponent } from './property-leads.component';

describe('PropertyLeadsComponent', () => {
  let component: PropertyLeadsComponent;
  let fixture: ComponentFixture<PropertyLeadsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PropertyLeadsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PropertyLeadsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
