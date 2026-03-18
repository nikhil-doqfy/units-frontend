import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResendIconComponent } from './resend-icon.component';

describe('ResendIconComponent', () => {
  let component: ResendIconComponent;
  let fixture: ComponentFixture<ResendIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResendIconComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ResendIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
