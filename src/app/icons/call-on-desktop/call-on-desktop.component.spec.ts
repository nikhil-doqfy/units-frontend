import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CallOnDesktopComponent } from './call-on-desktop.component';

describe('CallOnDesktopComponent', () => {
  let component: CallOnDesktopComponent;
  let fixture: ComponentFixture<CallOnDesktopComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CallOnDesktopComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CallOnDesktopComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
