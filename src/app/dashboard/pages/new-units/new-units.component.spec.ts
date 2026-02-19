import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewUnitsComponent } from './new-units.component';

describe('NewUnitsComponent', () => {
  let component: NewUnitsComponent;
  let fixture: ComponentFixture<NewUnitsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewUnitsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NewUnitsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
