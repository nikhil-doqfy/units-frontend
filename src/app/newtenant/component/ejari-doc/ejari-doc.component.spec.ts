import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EjariDocComponent } from './ejari-doc.component';

describe('EjariDocComponent', () => {
  let component: EjariDocComponent;
  let fixture: ComponentFixture<EjariDocComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EjariDocComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EjariDocComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
