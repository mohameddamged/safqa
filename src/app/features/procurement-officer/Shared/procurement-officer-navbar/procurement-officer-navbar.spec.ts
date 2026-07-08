import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcurementOfficerNavbar } from './procurement-officer-navbar';

describe('ProcurementOfficerNavbar', () => {
  let component: ProcurementOfficerNavbar;
  let fixture: ComponentFixture<ProcurementOfficerNavbar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProcurementOfficerNavbar],
    }).compileComponents();

    fixture = TestBed.createComponent(ProcurementOfficerNavbar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
