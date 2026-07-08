import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PoTracking } from './po-tracking';

describe('PoTracking', () => {
  let component: PoTracking;
  let fixture: ComponentFixture<PoTracking>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PoTracking],
    }).compileComponents();

    fixture = TestBed.createComponent(PoTracking);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
