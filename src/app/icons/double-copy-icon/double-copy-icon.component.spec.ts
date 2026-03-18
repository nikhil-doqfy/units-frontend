import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoubleCopyIconComponent } from './double-copy-icon.component';

describe('DoubleCopyIconComponent', () => {
  let component: DoubleCopyIconComponent;
  let fixture: ComponentFixture<DoubleCopyIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DoubleCopyIconComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DoubleCopyIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
