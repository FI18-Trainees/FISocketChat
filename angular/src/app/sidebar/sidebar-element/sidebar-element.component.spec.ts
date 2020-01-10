import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SidebarElementComponent } from './sidebar-element.component';

describe('SidebarElementComponent', () => {
  let component: SidebarElementComponent;
  let fixture: ComponentFixture<SidebarElementComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SidebarElementComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SidebarElementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
