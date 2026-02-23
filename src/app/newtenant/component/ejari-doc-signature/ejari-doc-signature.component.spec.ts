import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EjariDocSignatureComponent } from './ejari-doc-signature.component';

describe('EjariDocSignatureComponent', () => {
  let component: EjariDocSignatureComponent;
  let fixture: ComponentFixture<EjariDocSignatureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EjariDocSignatureComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EjariDocSignatureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
