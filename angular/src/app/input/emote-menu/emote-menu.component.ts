import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, Output, EventEmitter } from '@angular/core';
import Emotes from '../../../assets/emotes.json';

@Component({
  selector: 'app-emote-menu',
  templateUrl: './emote-menu.component.html',
  styleUrls: ['./emote-menu.component.scss']
})
export class EmoteMenuComponent implements OnInit, AfterViewInit {

  @ViewChild('emoteMenu', { static: false }) emoteMenu: ElementRef;
  @ViewChild('emoteButton', { static: false }) emoteButton: ElementRef;
  @Output() emoteEvent: EventEmitter<string> = new EventEmitter<string>();

  emoteList = Object.keys(Emotes);

  constructor() { }

  ngOnInit() { }

  ngAfterViewInit() {
    this.updateEmoteMenu();
  }

  updateEmoteMenu() {
    const rowElement = document.createElement('div');
    rowElement.classList.add('row', 'p-2');
    rowElement.style.maxHeight = '50rem';
    rowElement.style.minWidth = '375px';
    this.emoteMenu.nativeElement.append(rowElement);
    this.emoteList.forEach(key => {
      if (Emotes[key].menuDisplay) {
        const emoteitem = document.createElement('a');
        emoteitem.classList.add('curser-pointer', 'd-inline', 'text-nowrap', 'col', 'p-1');
        emoteitem.innerHTML = Emotes[key].menuDisplayCode;
        emoteitem.onclick = () => {
          this.emoteEvent.emit(key);
        };
        rowElement.append(emoteitem);
      }
    });
  }
}
