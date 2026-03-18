import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThreeDotsIconsComponent } from './three-dots-icons.component';

describe('ThreeDotsIconsComponent', () => {
  let component: ThreeDotsIconsComponent;
  let fixture: ComponentFixture<ThreeDotsIconsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ThreeDotsIconsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ThreeDotsIconsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
