import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchMailIconComponent } from './search-mail-icon.component';

describe('SearchMailIconComponent', () => {
  let component: SearchMailIconComponent;
  let fixture: ComponentFixture<SearchMailIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchMailIconComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SearchMailIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
