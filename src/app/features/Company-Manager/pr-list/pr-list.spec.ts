import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrList } from './pr-list';

describe('PrList', () => {
  let component: PrList;
  let fixture: ComponentFixture<PrList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrList],
    }).compileComponents();

    fixture = TestBed.createComponent(PrList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
