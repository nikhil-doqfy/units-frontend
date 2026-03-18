import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactNumberComponent } from './contact-number.component';

describe('ContactNumberComponent', () => {
  let component: ContactNumberComponent;
  let fixture: ComponentFixture<ContactNumberComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactNumberComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ContactNumberComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
