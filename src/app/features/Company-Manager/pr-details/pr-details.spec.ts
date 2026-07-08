import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrDetails } from './pr-details';

describe('PrDetails', () => {
  let component: PrDetails;
  let fixture: ComponentFixture<PrDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrDetails],
    }).compileComponents();

    fixture = TestBed.createComponent(PrDetails);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
