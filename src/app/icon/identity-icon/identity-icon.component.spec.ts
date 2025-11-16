import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IdentityIconComponent } from './identity-icon.component';

describe('IdentityIconComponent', () => {
  let component: IdentityIconComponent;
  let fixture: ComponentFixture<IdentityIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IdentityIconComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(IdentityIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
