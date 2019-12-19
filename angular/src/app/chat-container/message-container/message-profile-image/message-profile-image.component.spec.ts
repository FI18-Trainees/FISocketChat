import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MessageProfileImageComponent } from './message-profile-image.component';

describe('MessageProfileImageComponent', () => {
  let component: MessageProfileImageComponent;
  let fixture: ComponentFixture<MessageProfileImageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MessageProfileImageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MessageProfileImageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
