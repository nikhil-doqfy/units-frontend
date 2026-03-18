import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TermsconditionIconComponent } from './termscondition-icon.component';

describe('TermsconditionIconComponent', () => {
  let component: TermsconditionIconComponent;
  let fixture: ComponentFixture<TermsconditionIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TermsconditionIconComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TermsconditionIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
