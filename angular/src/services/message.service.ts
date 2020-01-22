import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MessageService {

  private messageSource = new Subject<string>();
  currentMessage = this.messageSource.asObservable();
  private usernameSource = new Subject<string>();
  clickedUsername = this.usernameSource.asObservable();

  constructor() { }

  newMessage(message: string) {
    this.messageSource.next(message);
  }

  usernameClicked(username: string) {
    this.usernameSource.next(username);
  }
}
