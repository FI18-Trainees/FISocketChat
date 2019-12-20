import { Component, OnInit } from '@angular/core';
import { ISitebarContent } from 'src/interfaces/ISitebarContent';
import { MediaType } from 'src/interfaces/ISitebarContentMedia';

@Component({
  selector: 'app-sitebar',
  templateUrl: './sitebar.component.html',
  styleUrls: ['./sitebar.component.css']
})
export class SitebarComponent implements OnInit {

  public sitebarElements: ISitebarContent[] = [];

  constructor() { }

  ngOnInit() {
    this.sitebarElements.push(
    {
      header: 'Info',
      id: 'logininfo_sitebar',
      text: 'Not logged in.',
      media: {
        mediaType: MediaType.image,
        mediaLink: '/public/assets/blaulicht.gif',
        mediaId: 'logininfo_picture'
      }
    },
    {
      header: 'GitHub',
      link: 'https://github.com/FI18-Trainees/FISocketChat',
      text: 'Check out our Repo.',
      media: {
        mediaType: MediaType.icon,
        mediaLink: 'fab fa-github fa-2x text-white mx-2'
      }
    }
    );
  }

}
