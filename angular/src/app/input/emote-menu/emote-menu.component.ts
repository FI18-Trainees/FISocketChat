import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, Output, EventEmitter } from '@angular/core';
import Emotes from '../../../assets/emotes.json';
import { ApiService } from 'src/services/api.service.js';
import { IEmoteResponse } from 'src/interfaces/IEmoteResponse.js';

@Component({
  selector: 'app-emote-menu',
  templateUrl: './emote-menu.component.html',
  styleUrls: ['./emote-menu.component.scss']
})
export class EmoteMenuComponent implements OnInit, AfterViewInit {

  @ViewChild('emoteMenu') emoteMenu: ElementRef;
  @ViewChild('emoteButton') emoteButton: ElementRef;
  @Output() emoteEvent: EventEmitter<string> = new EventEmitter<string>();

  emoteList = Object.keys(Emotes);
  apiEmoteList: IEmoteResponse[] = [];

  constructor(private api: ApiService) { }

  ngOnInit() { }

  ngAfterViewInit() {
    this.apiEmoteList = this.api.getEmotes();
    this.api.emoteSubject.subscribe(() => {
      this.updateEmoteMenu();
      console.log('Updated');
    });
  }

  updateEmoteMenu() {
    const rowElement = document.createElement('div');
    rowElement.classList.add('row', 'p-2');
    rowElement.style.maxHeight = '50rem';
    rowElement.style.minWidth = '375px';
    this.emoteMenu.nativeElement.append(rowElement);

    console.log('loadMenu');

    this.apiEmoteList.forEach((emote: IEmoteResponse) => {
      console.log(emote);
      if (emote.value.menuDisplay) {
        const emoteitem = document.createElement('a');
        emoteitem.classList.add('curser-pointer', 'd-inline', 'text-nowrap', 'col', 'p-1');
        emoteitem.innerHTML = emote.value.menuDisplayCode;
        emoteitem.onclick = () => {
          this.emoteEvent.emit(emote.name);
        };
        rowElement.append(emoteitem);
      }
    });
/*
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
*/
  }
}
