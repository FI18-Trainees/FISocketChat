import { Component, OnInit, Input } from '@angular/core';
import { ISidebarContent } from 'src/interfaces/ISidebarContent';
import { MediaType } from 'src/interfaces/ISidebarContentMedia';

@Component({
  selector: 'app-sidebar-content',
  templateUrl: './Sidebar-content.component.html',
  styleUrls: ['./Sidebar-content.component.css']
})
export class SidebarContentComponent implements OnInit {

  @Input()
  content: ISidebarContent;
  mediaType: MediaType;
  constructor() { }

  ngOnInit() {
  }

}
