import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BarsCardComponent } from './bars-card.component';

describe('BarsCardComponent', () => {
  let component: BarsCardComponent;
  let fixture: ComponentFixture<BarsCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BarsCardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BarsCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
