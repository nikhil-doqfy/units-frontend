import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchWhatsappIconComponent } from './search-whatsapp-icon.component';

describe('SearchWhatsappIconComponent', () => {
  let component: SearchWhatsappIconComponent;
  let fixture: ComponentFixture<SearchWhatsappIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchWhatsappIconComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SearchWhatsappIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
