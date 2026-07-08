import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InventoryOfficerSidebar } from './inventory-officer-sidebar';

describe('InventoryOfficerSidebar', () => {
  let component: InventoryOfficerSidebar;
  let fixture: ComponentFixture<InventoryOfficerSidebar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InventoryOfficerSidebar],
    }).compileComponents();

    fixture = TestBed.createComponent(InventoryOfficerSidebar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
