import { Component, OnInit, Input } from '@angular/core';
import { ISidebarContent } from 'src/interfaces/ISidebarContent';
import { MediaType } from 'src/interfaces/ISidebarContentMedia';

@Component({
  selector: 'app-sidebar-content',
  templateUrl: './sidebar-content.component.html',
  styleUrls: ['./sidebar-content.component.css']
})
export class SidebarContentComponent implements OnInit {

  @Input()
  content: ISidebarContent;
  mediaType: MediaType;
  constructor() { }

  ngOnInit() {
  }

}
