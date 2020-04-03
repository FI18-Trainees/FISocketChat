import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { SocketService } from './socket.service';

@Injectable({
  providedIn: 'root'
})
export class MessageService {

  usernameSource = new Subject<string>();

  constructor(private socketService: SocketService) { }

  newMessage(messageContent: string) {
    const priority = 'low';
    if (messageContent.startsWith('/')) {
      // send Command
      this.socketService.sendCommand({ display_name: 'Test', message: messageContent, token: 'Test' })
    } else {
      // send Message
      this.socketService.sendMessage({ display_name: 'Test', message: messageContent, token: 'Test' });
    }
  }

  usernameClicked(username: string) {
    if (username !== 'System') {
      this.usernameSource.next(username);
    }
  }
}
