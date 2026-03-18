import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CurveIconsComponent } from './curve-icons.component';

describe('CurveIconsComponent', () => {
  let component: CurveIconsComponent;
  let fixture: ComponentFixture<CurveIconsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CurveIconsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CurveIconsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
