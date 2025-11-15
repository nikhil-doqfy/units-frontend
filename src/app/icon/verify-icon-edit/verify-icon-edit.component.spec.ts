import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerifyIconEditComponent } from './verify-icon-edit.component';

describe('VerifyIconEditComponent', () => {
  let component: VerifyIconEditComponent;
  let fixture: ComponentFixture<VerifyIconEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerifyIconEditComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(VerifyIconEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
