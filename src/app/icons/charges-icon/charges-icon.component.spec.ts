import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChargesIconComponent } from './charges-icon.component';

describe('ChargesIconComponent', () => {
  let component: ChargesIconComponent;
  let fixture: ComponentFixture<ChargesIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChargesIconComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ChargesIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
