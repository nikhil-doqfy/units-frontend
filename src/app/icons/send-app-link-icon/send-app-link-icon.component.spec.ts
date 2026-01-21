import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SendAppLinkIconComponent } from './send-app-link-icon.component';

describe('SendAppLinkIconComponent', () => {
  let component: SendAppLinkIconComponent;
  let fixture: ComponentFixture<SendAppLinkIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SendAppLinkIconComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SendAppLinkIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
