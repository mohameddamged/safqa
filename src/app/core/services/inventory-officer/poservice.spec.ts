import { TestBed } from '@angular/core/testing';

import { Poservice } from './poservice';

describe('Poservice', () => {
  let service: Poservice;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Poservice);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
