import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReplaceChequeComponent } from './replace-cheque.component';

describe('ReplaceChequeComponent', () => {
  let component: ReplaceChequeComponent;
  let fixture: ComponentFixture<ReplaceChequeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReplaceChequeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ReplaceChequeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
