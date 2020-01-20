import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import Emotes from '../../../assets/emotes.json';

@Component({
  selector: 'app-emote-menu',
  templateUrl: './emote-menu.component.html',
  styleUrls: ['./emote-menu.component.scss']
})
export class EmoteMenuComponent implements OnInit, AfterViewInit {

  @ViewChild('emoteMenu', { static: false }) emoteMenu: ElementRef;

  emoteList = Object.keys(Emotes);

  constructor() { }

  ngOnInit() { }

  ngAfterViewInit() {
    this.updateEmoteMenu();
  }

  updateEmoteMenu() {
    this.emoteList.forEach(key => {
      if (Emotes[key].menuDisplay) {
        const emoteitem = document.createElement('a');
        emoteitem.classList.add('cursor-pointer');
        emoteitem.innerHTML = Emotes[key].menuDisplayCode;
        this.emoteMenu.nativeElement.append(emoteitem);
      }
    });
  }
}
