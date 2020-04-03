import { Component, OnInit, Input } from '@angular/core';
import { IEmbed } from 'src/interfaces/IEmbed';

@Component({
  selector: 'app-embed',
  templateUrl: './embed.component.html',
  styleUrls: ['./embed.component.scss']
})
export class EmbedComponent implements OnInit {

  @Input()
  embed: IEmbed;

  constructor() { }

  ngOnInit() {
    console.log(this.embed);
  }

}
