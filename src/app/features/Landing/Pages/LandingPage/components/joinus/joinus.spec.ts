import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Joinus } from './joinus';

describe('Joinus', () => {
  let component: Joinus;
  let fixture: ComponentFixture<Joinus>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Joinus],
    }).compileComponents();

    fixture = TestBed.createComponent(Joinus);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
