import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewPropertryIconsComponent } from './new-propertry-icons.component';

describe('NewPropertryIconsComponent', () => {
  let component: NewPropertryIconsComponent;
  let fixture: ComponentFixture<NewPropertryIconsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewPropertryIconsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NewPropertryIconsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
