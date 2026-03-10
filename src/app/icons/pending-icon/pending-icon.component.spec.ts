import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PendingIconComponent } from './pending-icon.component';

describe('PendingIconComponent', () => {
  let component: PendingIconComponent;
  let fixture: ComponentFixture<PendingIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PendingIconComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PendingIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
