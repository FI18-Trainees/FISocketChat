import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { IMessage } from 'src/interfaces/IMessage';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SocketService {

  constructor(private socket: Socket) { this.reconnect(); }

  sendMessage(msg: {display_name: string, message: string, token: string}) {
    this.socket.emit('chat_message', msg);
    console.log(this.checkConnection());
  }

  getMessage(): Observable<IMessage> {
    return this.socket.fromEvent('chat_message');
  }

  close() {
    this.socket.disconnect();
  }

  reconnect() {
    this.socket.connect();
  }

  checkConnection(): boolean {
    return this.socket.ioSocket.connected;
  }
}
