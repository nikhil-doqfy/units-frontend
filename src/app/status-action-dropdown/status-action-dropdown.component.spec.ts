import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatusActionDropdownComponent } from './status-action-dropdown.component';

describe('StatusActionDropdownComponent', () => {
  let component: StatusActionDropdownComponent;
  let fixture: ComponentFixture<StatusActionDropdownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatusActionDropdownComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(StatusActionDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
