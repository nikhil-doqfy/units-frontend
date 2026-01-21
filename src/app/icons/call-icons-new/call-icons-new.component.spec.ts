import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CallIconsNewComponent } from './call-icons-new.component';

describe('CallIconsNewComponent', () => {
  let component: CallIconsNewComponent;
  let fixture: ComponentFixture<CallIconsNewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CallIconsNewComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CallIconsNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
