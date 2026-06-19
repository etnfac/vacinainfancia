import { TestBed } from '@angular/core/testing';

import { Vacina } from './vacina';

describe('Vacina', () => {
  let service: Vacina;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Vacina);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
