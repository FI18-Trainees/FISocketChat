import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { IMessage } from 'src/interfaces/IMessage';

@Injectable({
  providedIn: 'root'
})
export class MessagehistoryService {

  sentMessages: string[] = [];
  index = 0;

  constructor() {}

  addMessage(text: string) {
    this.sentMessages.push(text);
  }

  getPreviousMessage(): string {
    this.index--;
    if (this.index < 0) {
      this.index = 0;
    }
    return this.sentMessages[this.index];
  }

  getNextMessage(): string {
    this.index++;
    if (this.index > this.sentMessages.length - 1) {
      this.index = this.sentMessages.length - 1;
    }
    return this.sentMessages[this.index];
  }

  getCurrentMessage(): string {
    return this.sentMessages[this.index];
  }
}
