import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApproveIconComponent } from './approve-icon.component';

describe('ApproveIconComponent', () => {
  let component: ApproveIconComponent;
  let fixture: ComponentFixture<ApproveIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApproveIconComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ApproveIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
