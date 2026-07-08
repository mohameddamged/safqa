import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompanyInfo } from './company-info';

describe('CompanyInfo', () => {
  let component: CompanyInfo;
  let fixture: ComponentFixture<CompanyInfo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompanyInfo],
    }).compileComponents();

    fixture = TestBed.createComponent(CompanyInfo);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
