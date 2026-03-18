import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InviteToastComponentComponent } from './invite-toast-component.component';

describe('InviteToastComponentComponent', () => {
  let component: InviteToastComponentComponent;
  let fixture: ComponentFixture<InviteToastComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InviteToastComponentComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(InviteToastComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
