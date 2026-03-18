import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScannericonComponent } from './scannericon.component';

describe('ScannericonComponent', () => {
  let component: ScannericonComponent;
  let fixture: ComponentFixture<ScannericonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScannericonComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ScannericonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
