import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompanyManagerNavbar } from './company-manager-navbar';

describe('CompanyManagerNavbar', () => {
  let component: CompanyManagerNavbar;
  let fixture: ComponentFixture<CompanyManagerNavbar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompanyManagerNavbar],
    }).compileComponents();

    fixture = TestBed.createComponent(CompanyManagerNavbar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
