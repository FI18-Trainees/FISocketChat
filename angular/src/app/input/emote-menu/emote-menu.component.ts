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

  apiEmoteList: IEmoteResponse[] = [];

  constructor(private api: ApiService) { }

  ngOnInit() {
    this.api.getEmotes().subscribe((emotes) => {
      Object.keys(emotes).forEach((key) => {
        this.apiEmoteList.push({
          name: key,
          value: {
            replace: emotes[key].replace,
            menuDisplay: emotes[key].menuDisplay,
            menuDisplayCode: emotes[key].menuDisplayCode
          }
        });
      });
      this.updateEmoteMenu();
    });
  }

  ngAfterViewInit() { }

  updateEmoteMenu() {
    const rowElement = document.createElement('div');
    rowElement.classList.add('row', 'p-2');
    rowElement.style.maxHeight = '50rem';
    rowElement.style.minWidth = '375px';
    this.emoteMenu.nativeElement.append(rowElement);

    this.apiEmoteList.forEach((emote: IEmoteResponse) => {
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
  }
}
