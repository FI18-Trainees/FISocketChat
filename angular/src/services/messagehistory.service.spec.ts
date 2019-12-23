import { TestBed } from '@angular/core/testing';

import { MessagehistoryService } from './messagehistory.service';

describe('MessagehistoryService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: MessagehistoryService = TestBed.get(MessagehistoryService);
    expect(service).toBeTruthy();
  });
});
