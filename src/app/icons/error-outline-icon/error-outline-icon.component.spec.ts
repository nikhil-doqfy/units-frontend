import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ErrorOutlineIconComponent } from './error-outline-icon.component';

describe('ErrorOutlineIconComponent', () => {
  let component: ErrorOutlineIconComponent;
  let fixture: ComponentFixture<ErrorOutlineIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ErrorOutlineIconComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ErrorOutlineIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
