import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WahstappIcon1Component } from './wahstapp-icon1.component';

describe('WahstappIcon1Component', () => {
  let component: WahstappIcon1Component;
  let fixture: ComponentFixture<WahstappIcon1Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WahstappIcon1Component]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WahstappIcon1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
