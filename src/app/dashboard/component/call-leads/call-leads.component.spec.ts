import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CallLeadsComponent } from './call-leads.component';

describe('CallLeadsComponent', () => {
  let component: CallLeadsComponent;
  let fixture: ComponentFixture<CallLeadsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CallLeadsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CallLeadsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
