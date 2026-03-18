import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlatfromBadgeComponent } from './platfrom-badge.component';

describe('PlatfromBadgeComponent', () => {
  let component: PlatfromBadgeComponent;
  let fixture: ComponentFixture<PlatfromBadgeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlatfromBadgeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PlatfromBadgeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
