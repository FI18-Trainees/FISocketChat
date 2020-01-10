import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SitebarElementComponent } from './sitebar-element.component';

describe('SitebarElementComponent', () => {
  let component: SitebarElementComponent;
  let fixture: ComponentFixture<SitebarElementComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SitebarElementComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SitebarElementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
