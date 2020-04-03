import { Injectable, Inject } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { IMessage } from 'src/interfaces/IMessage';
import { Observable } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})
export class SocketService {

  socket: ChatSocket;

  constructor(private cookieService: CookieService) {
    this.socket = new ChatSocket(this.cookieService.get('access_token'));
    this.reconnect();
  }

  sendMessage(msg: { display_name: string, message: string, token: string }) {
    this.socket.emit('chat_message', msg);
  }

  getMessage(): Observable<IMessage> {
    return this.socket.fromEvent('chat_message');
  }

  getLoginMode(): Observable<boolean> {
    return this.socket.fromEvent('status');
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

@Injectable()
export class ChatSocket extends Socket {

  constructor(public cookieValue: string) {
    super({ url: '/', options: { secure: true, transports: ['polling', 'websocket'], query: 'token=' + cookieValue } });
  }

}
