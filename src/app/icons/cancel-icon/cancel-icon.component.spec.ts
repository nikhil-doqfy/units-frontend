import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CancelIconComponent } from './cancel-icon.component';

describe('CancelIconComponent', () => {
  let component: CancelIconComponent;
  let fixture: ComponentFixture<CancelIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CancelIconComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CancelIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
