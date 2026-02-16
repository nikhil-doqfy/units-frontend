import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChequesIconComponent } from './cheques-icon.component';

describe('ChequesIconComponent', () => {
  let component: ChequesIconComponent;
  let fixture: ComponentFixture<ChequesIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChequesIconComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ChequesIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
