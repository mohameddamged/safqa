import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InventoryProfile } from './inventory-profile';

describe('InventoryProfile', () => {
  let component: InventoryProfile;
  let fixture: ComponentFixture<InventoryProfile>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InventoryProfile],
    }).compileComponents();

    fixture = TestBed.createComponent(InventoryProfile);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
