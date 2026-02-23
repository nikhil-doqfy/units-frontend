import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SendInviteIconComponent } from './send-invite-icon.component';

describe('SendInviteIconComponent', () => {
  let component: SendInviteIconComponent;
  let fixture: ComponentFixture<SendInviteIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SendInviteIconComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SendInviteIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
