import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SignatureIconComponent } from './signature-icon.component';

describe('SignatureIconComponent', () => {
  let component: SignatureIconComponent;
  let fixture: ComponentFixture<SignatureIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SignatureIconComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SignatureIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
