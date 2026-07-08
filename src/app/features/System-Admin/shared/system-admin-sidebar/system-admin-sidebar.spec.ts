import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SystemAdminSidebar } from './system-admin-sidebar';

describe('SystemAdminSidebar', () => {
  let component: SystemAdminSidebar;
  let fixture: ComponentFixture<SystemAdminSidebar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SystemAdminSidebar],
    }).compileComponents();

    fixture = TestBed.createComponent(SystemAdminSidebar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
