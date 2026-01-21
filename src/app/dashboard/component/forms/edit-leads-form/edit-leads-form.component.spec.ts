import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditLeadsFormComponent } from './edit-leads-form.component';

describe('EditLeadsFormComponent', () => {
  let component: EditLeadsFormComponent;
  let fixture: ComponentFixture<EditLeadsFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditLeadsFormComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditLeadsFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
