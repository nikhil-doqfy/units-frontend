import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SharePlatfromIconComponent } from './share-platfrom-icon.component';

describe('SharePlatfromIconComponent', () => {
  let component: SharePlatfromIconComponent;
  let fixture: ComponentFixture<SharePlatfromIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SharePlatfromIconComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SharePlatfromIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
