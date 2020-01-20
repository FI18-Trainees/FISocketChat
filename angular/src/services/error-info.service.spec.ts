import { TestBed } from '@angular/core/testing';

import { ErrorInfoService } from './error-info.service';

describe('ErrorInfoService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ErrorInfoService = TestBed.get(ErrorInfoService);
    expect(service).toBeTruthy();
  });
});
