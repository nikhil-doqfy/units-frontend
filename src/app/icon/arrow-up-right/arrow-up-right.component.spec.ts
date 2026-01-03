import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArrowUpRightComponent } from './arrow-up-right.component';

describe('ArrowUpRightComponent', () => {
  let component: ArrowUpRightComponent;
  let fixture: ComponentFixture<ArrowUpRightComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArrowUpRightComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ArrowUpRightComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
