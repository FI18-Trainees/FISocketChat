import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SitebarContentComponent } from './sidebar-content.component';

describe('SitebarContentComponent', () => {
  let component: SitebarContentComponent;
  let fixture: ComponentFixture<SitebarContentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SitebarContentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SitebarContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
