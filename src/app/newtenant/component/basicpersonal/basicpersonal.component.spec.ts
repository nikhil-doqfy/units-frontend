import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BasicpersonalComponent } from './basicpersonal.component';

describe('BasicpersonalComponent', () => {
  let component: BasicpersonalComponent;
  let fixture: ComponentFixture<BasicpersonalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BasicpersonalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BasicpersonalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
