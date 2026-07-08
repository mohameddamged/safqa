import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcurementOfficerDashboard } from './procurement-officer-dashboard';

describe('ProcurementOfficerDashboard', () => {
  let component: ProcurementOfficerDashboard;
  let fixture: ComponentFixture<ProcurementOfficerDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProcurementOfficerDashboard],
    }).compileComponents();

    fixture = TestBed.createComponent(ProcurementOfficerDashboard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
