import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AditionaldocumentComponent } from './aditionaldocument.component';

describe('AditionaldocumentComponent', () => {
  let component: AditionaldocumentComponent;
  let fixture: ComponentFixture<AditionaldocumentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AditionaldocumentComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AditionaldocumentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
