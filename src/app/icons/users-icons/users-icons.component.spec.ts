import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsersIconsComponent } from './users-icons.component';

describe('UsersIconsComponent', () => {
  let component: UsersIconsComponent;
  let fixture: ComponentFixture<UsersIconsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsersIconsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UsersIconsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
