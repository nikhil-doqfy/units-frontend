import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DisableIconComponent } from './disable-icon.component';

describe('DisableIconComponent', () => {
  let component: DisableIconComponent;
  let fixture: ComponentFixture<DisableIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DisableIconComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DisableIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
