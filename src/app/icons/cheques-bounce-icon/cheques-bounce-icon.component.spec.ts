import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChequesBounceIconComponent } from './cheques-bounce-icon.component';

describe('ChequesBounceIconComponent', () => {
  let component: ChequesBounceIconComponent;
  let fixture: ComponentFixture<ChequesBounceIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChequesBounceIconComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ChequesBounceIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
