import { Component, OnInit, Input } from '@angular/core';
import { ISitebarContent } from 'src/interfaces/ISitebarContent';
import { MediaType } from 'src/interfaces/ISitebarContentMedia';

@Component({
  selector: 'app-sitebar-content',
  templateUrl: './sitebar-content.component.html',
  styleUrls: ['./sitebar-content.component.css']
})
export class SitebarContentComponent implements OnInit {

  @Input()
  content: ISitebarContent;
  mediaType: MediaType;
  constructor() { }

  ngOnInit() {
  }

}
