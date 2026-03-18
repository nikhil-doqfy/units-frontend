import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Calender1IconComponent } from './calender1-icon.component';

describe('Calender1IconComponent', () => {
  let component: Calender1IconComponent;
  let fixture: ComponentFixture<Calender1IconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Calender1IconComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(Calender1IconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
