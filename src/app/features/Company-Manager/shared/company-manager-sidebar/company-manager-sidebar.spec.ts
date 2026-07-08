import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompanyManagerSidebar } from './company-manager-sidebar';

describe('CompanyManagerSidebar', () => {
  let component: CompanyManagerSidebar;
  let fixture: ComponentFixture<CompanyManagerSidebar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompanyManagerSidebar],
    }).compileComponents();

    fixture = TestBed.createComponent(CompanyManagerSidebar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
