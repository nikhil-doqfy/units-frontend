import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PauseIconsComponent } from './pause-icons.component';

describe('PauseIconsComponent', () => {
  let component: PauseIconsComponent;
  let fixture: ComponentFixture<PauseIconsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PauseIconsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PauseIconsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
