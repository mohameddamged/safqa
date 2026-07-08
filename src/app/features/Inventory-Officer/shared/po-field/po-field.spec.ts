import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PoField } from './po-field';

describe('PoField', () => {
  let component: PoField;
  let fixture: ComponentFixture<PoField>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PoField],
    }).compileComponents();

    fixture = TestBed.createComponent(PoField);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
