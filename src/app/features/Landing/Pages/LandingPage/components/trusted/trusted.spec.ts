import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Trusted } from './trusted';

describe('Trusted', () => {
  let component: Trusted;
  let fixture: ComponentFixture<Trusted>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Trusted],
    }).compileComponents();

    fixture = TestBed.createComponent(Trusted);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
