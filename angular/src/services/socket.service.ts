import { Injectable, Inject } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { IMessage } from 'src/interfaces/IMessage';
import { Observable, BehaviorSubject } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})
export class SocketService {

  socket: ChatSocket;

  connectStatus: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor(private cookieService: CookieService) {
    this.socket = new ChatSocket(this.cookieService.get('access_token'));
    this.reconnect();

    this.socket.on('disconnect', () => {
      this.connectStatus.next(false);
    });
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
    this.connectStatus.next(false);
  }

  reconnect() {
    this.socket.connect();
    this.connectStatus.next(true);
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
