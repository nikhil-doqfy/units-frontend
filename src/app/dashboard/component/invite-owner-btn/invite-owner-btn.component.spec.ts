import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InviteOwnerBtnComponent } from './invite-owner-btn.component';

describe('InviteOwnerBtnComponent', () => {
  let component: InviteOwnerBtnComponent;
  let fixture: ComponentFixture<InviteOwnerBtnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InviteOwnerBtnComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(InviteOwnerBtnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
