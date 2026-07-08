import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpcomingPos } from './upcoming-pos';

describe('UpcomingPos', () => {
  let component: UpcomingPos;
  let fixture: ComponentFixture<UpcomingPos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpcomingPos],
    }).compileComponents();

    fixture = TestBed.createComponent(UpcomingPos);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
