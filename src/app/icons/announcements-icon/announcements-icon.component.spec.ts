import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnnouncementsIconComponent } from './announcements-icon.component';

describe('AnnouncementsIconComponent', () => {
  let component: AnnouncementsIconComponent;
  let fixture: ComponentFixture<AnnouncementsIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnnouncementsIconComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AnnouncementsIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
