import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerificationList } from './verification-list';

describe('VerificationList', () => {
  let component: VerificationList;
  let fixture: ComponentFixture<VerificationList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerificationList],
    }).compileComponents();

    fixture = TestBed.createComponent(VerificationList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
