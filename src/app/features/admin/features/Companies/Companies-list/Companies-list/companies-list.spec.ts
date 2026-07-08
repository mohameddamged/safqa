import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompainesList } from './compaines-list';

describe('CompainesList', () => {
  let component: CompainesList;
  let fixture: ComponentFixture<CompainesList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompainesList],
    }).compileComponents();

    fixture = TestBed.createComponent(CompainesList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
