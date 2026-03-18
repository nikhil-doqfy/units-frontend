import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PngIconComponent } from './png-icon.component';

describe('PngIconComponent', () => {
  let component: PngIconComponent;
  let fixture: ComponentFixture<PngIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PngIconComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PngIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
