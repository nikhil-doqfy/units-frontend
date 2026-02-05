import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TenancyledgerComponent } from './tenancyledger.component';

describe('TenancyledgerComponent', () => {
  let component: TenancyledgerComponent;
  let fixture: ComponentFixture<TenancyledgerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TenancyledgerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TenancyledgerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
