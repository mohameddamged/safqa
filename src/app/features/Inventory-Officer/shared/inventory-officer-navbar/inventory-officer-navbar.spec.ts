import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InventoryOfficerNavbar } from './inventory-officer-navbar';

describe('InventoryOfficerNavbar', () => {
  let component: InventoryOfficerNavbar;
  let fixture: ComponentFixture<InventoryOfficerNavbar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InventoryOfficerNavbar],
    }).compileComponents();

    fixture = TestBed.createComponent(InventoryOfficerNavbar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
