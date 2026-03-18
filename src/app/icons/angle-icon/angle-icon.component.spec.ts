import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AngleIconComponent } from './angle-icon.component';

describe('AngleIconComponent', () => {
  let component: AngleIconComponent;
  let fixture: ComponentFixture<AngleIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AngleIconComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AngleIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
