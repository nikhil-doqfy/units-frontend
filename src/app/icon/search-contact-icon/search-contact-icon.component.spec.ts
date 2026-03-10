import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchContactIconComponent } from './search-contact-icon.component';

describe('SearchContactIconComponent', () => {
  let component: SearchContactIconComponent;
  let fixture: ComponentFixture<SearchContactIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchContactIconComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SearchContactIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
