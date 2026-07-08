import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcurementOfficerSidebar } from './procurement-officer-sidebar';

describe('ProcurementOfficerSidebar', () => {
  let component: ProcurementOfficerSidebar;
  let fixture: ComponentFixture<ProcurementOfficerSidebar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProcurementOfficerSidebar],
    }).compileComponents();

    fixture = TestBed.createComponent(ProcurementOfficerSidebar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
