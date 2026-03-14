import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SignedSuccessfullyIconComponent } from './signed-successfully-icon.component';

describe('SignedSuccessfullyIconComponent', () => {
  let component: SignedSuccessfullyIconComponent;
  let fixture: ComponentFixture<SignedSuccessfullyIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SignedSuccessfullyIconComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SignedSuccessfullyIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
