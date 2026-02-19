import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DownIconComponent } from './down-icon.component';

describe('DownIconComponent', () => {
  let component: DownIconComponent;
  let fixture: ComponentFixture<DownIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DownIconComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DownIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
