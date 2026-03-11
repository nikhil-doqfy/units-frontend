import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayIconsComponent } from './play-icons.component';

describe('PlayIconsComponent', () => {
  let component: PlayIconsComponent;
  let fixture: ComponentFixture<PlayIconsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlayIconsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PlayIconsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
