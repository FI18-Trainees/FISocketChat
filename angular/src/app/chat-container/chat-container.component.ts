import { Component, OnInit } from '@angular/core';
import { AppComponent } from '../app.component';

@Component({
  selector: 'app-chat-container',
  templateUrl: './chat-container.component.html',
  styleUrls: ['./chat-container.component.css']
})
export class ChatContainerComponent implements OnInit {

  constructor() { }

  static updateScroll() {
    if (ChatContainerComponent.checkOverflow(document.getElementById('messages') as HTMLDivElement)) { // check if chat would overflow currentSize and refresh scrollbar
        // $('.nano').nanoScroller();
        if (AppComponent.getAutoscroll()) {
            const chatdiv = document.querySelector('#messages') as HTMLDivElement;
            chatdiv.scrollTop = chatdiv.scrollHeight;
            return true;
        }
        return false;
    }
  }

  // Determines if the passed element is overflowing its bounds, either vertically or horizontally.
  // Will temporarily modify the "overflow" style to detect this if necessary.
  static checkOverflow(el: HTMLDivElement) {
    console.log(el);
    const curOverflow = el.style.overflow;
    if (!curOverflow || curOverflow === 'visible') {
        el.style.overflow = 'hidden';
    }

    const isOverflowing = el.clientWidth < el.scrollWidth || el.clientHeight < el.scrollHeight;
    el.style.overflow = curOverflow;

    return isOverflowing;
  }

  ngOnInit() {
  }
}
