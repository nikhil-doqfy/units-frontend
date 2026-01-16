import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ToggleiconComponent } from './toggleicon.component';

describe('ToggleiconComponent', () => {
  let component: ToggleiconComponent;
  let fixture: ComponentFixture<ToggleiconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToggleiconComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ToggleiconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
