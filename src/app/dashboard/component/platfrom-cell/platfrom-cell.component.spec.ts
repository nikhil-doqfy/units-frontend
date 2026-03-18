import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlatfromCellComponent } from './platfrom-cell.component';

describe('PlatfromCellComponent', () => {
  let component: PlatfromCellComponent;
  let fixture: ComponentFixture<PlatfromCellComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlatfromCellComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PlatfromCellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
