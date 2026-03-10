import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlockIconComponent } from './block-icon.component';

describe('BlockIconComponent', () => {
  let component: BlockIconComponent;
  let fixture: ComponentFixture<BlockIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BlockIconComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BlockIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
