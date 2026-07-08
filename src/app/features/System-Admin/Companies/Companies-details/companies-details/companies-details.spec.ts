import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompaniesDetails } from './companies-details';

describe('CompaniesDetails', () => {
  let component: CompaniesDetails;
  let fixture: ComponentFixture<CompaniesDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompaniesDetails],
    }).compileComponents();

    fixture = TestBed.createComponent(CompaniesDetails);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
