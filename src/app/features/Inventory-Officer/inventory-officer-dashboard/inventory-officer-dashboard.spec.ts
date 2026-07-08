import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InventoryOfficerDashboard } from './inventory-officer-dashboard';

describe('InventoryOfficerDashboard', () => {
  let component: InventoryOfficerDashboard;
  let fixture: ComponentFixture<InventoryOfficerDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InventoryOfficerDashboard],
    }).compileComponents();

    fixture = TestBed.createComponent(InventoryOfficerDashboard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
