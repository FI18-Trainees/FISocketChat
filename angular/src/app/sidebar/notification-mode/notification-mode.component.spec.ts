import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NotificationModeComponent } from './notification-mode.component';

describe('NotificationModeComponent', () => {
  let component: NotificationModeComponent;
  let fixture: ComponentFixture<NotificationModeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NotificationModeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NotificationModeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
