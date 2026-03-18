import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewUnitsIconComponent } from './new-units-icon.component';

describe('NewUnitsIconComponent', () => {
  let component: NewUnitsIconComponent;
  let fixture: ComponentFixture<NewUnitsIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewUnitsIconComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NewUnitsIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
