import { Injectable } from '@angular/core';
import { ReplaySubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MessageService {

  private messageSource = new ReplaySubject<string>();
  currentMessage = this.messageSource.asObservable();

  constructor() { }

  newMessage(message: string) {
    this.messageSource.next(message);
  }
}
