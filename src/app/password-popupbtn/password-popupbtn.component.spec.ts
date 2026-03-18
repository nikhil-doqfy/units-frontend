import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PasswordPopupbtnComponent } from './password-popupbtn.component';

describe('PasswordPopupbtnComponent', () => {
  let component: PasswordPopupbtnComponent;
  let fixture: ComponentFixture<PasswordPopupbtnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PasswordPopupbtnComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PasswordPopupbtnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
