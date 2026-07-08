import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcurementOfficerLayout } from './procurement-officer-layout';

describe('ProcurementOfficerLayout', () => {
  let component: ProcurementOfficerLayout;
  let fixture: ComponentFixture<ProcurementOfficerLayout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProcurementOfficerLayout],
    }).compileComponents();

    fixture = TestBed.createComponent(ProcurementOfficerLayout);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
