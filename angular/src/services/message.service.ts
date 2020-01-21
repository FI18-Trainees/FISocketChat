import { Injectable } from '@angular/core';
import { ReplaySubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MessageService {

  private messageSource = new ReplaySubject<string>();
  currentMessage = this.messageSource.asObservable();
  private usernameSource = new ReplaySubject<string>();
  clickedUsername = this.usernameSource.asObservable();

  constructor() { }

  newMessage(message: string) {
    this.messageSource.next(message);
  }

  usernameClicked(username: string) {
    this.usernameSource.next(username);
  }
}
