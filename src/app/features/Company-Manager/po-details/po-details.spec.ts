import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PoDetails } from './po-details';

describe('PoDetails', () => {
  let component: PoDetails;
  let fixture: ComponentFixture<PoDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PoDetails],
    }).compileComponents();

    fixture = TestBed.createComponent(PoDetails);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
