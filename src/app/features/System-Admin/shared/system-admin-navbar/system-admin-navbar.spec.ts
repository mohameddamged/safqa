import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SystemAdminNavbar } from './system-admin-navbar';

describe('SystemAdminNavbar', () => {
  let component: SystemAdminNavbar;
  let fixture: ComponentFixture<SystemAdminNavbar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SystemAdminNavbar],
    }).compileComponents();

    fixture = TestBed.createComponent(SystemAdminNavbar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
