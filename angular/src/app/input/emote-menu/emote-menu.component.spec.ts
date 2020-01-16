import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EmoteMenuComponent } from './emote-menu.component';

describe('EmoteMenuComponent', () => {
  let component: EmoteMenuComponent;
  let fixture: ComponentFixture<EmoteMenuComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EmoteMenuComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmoteMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
