import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PricingCta } from './pricing-cta';

describe('PricingCta', () => {
  let component: PricingCta;
  let fixture: ComponentFixture<PricingCta>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PricingCta],
    }).compileComponents();

    fixture = TestBed.createComponent(PricingCta);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
