import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompanyLayout } from './company-layout';

describe('CompanyLayout', () => {
  let component: CompanyLayout;
  let fixture: ComponentFixture<CompanyLayout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompanyLayout],
    }).compileComponents();

    fixture = TestBed.createComponent(CompanyLayout);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
