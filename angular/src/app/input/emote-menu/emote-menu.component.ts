import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-emote-menu',
  templateUrl: './emote-menu.component.html',
  styleUrls: ['./emote-menu.component.scss']
})
export class EmoteMenuComponent implements OnInit {

  emotelist: string[] = [];

  constructor() { }

  ngOnInit() {
  }

}
