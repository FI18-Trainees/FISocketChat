import { Injectable, Inject } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { IMessage } from 'src/interfaces/IMessage';
import { Observable, BehaviorSubject } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';
import { IStatus } from 'src/interfaces/IStatus';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root'
})
export class SocketService {

  socket: ChatSocket;

  connectStatus: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  loginmode: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  userCount: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  username: BehaviorSubject<string> = new BehaviorSubject<string>('');
  chatColor: BehaviorSubject<string> = new BehaviorSubject<string>('');

  constructor(private cookieService: CookieService, private notificationService: NotificationService) {
    this.socket = new ChatSocket(this.cookieService.get('access_token'));
    this.reconnect();

    this.socket.on('disconnect', () => {
      this.connectStatus.next(false);
      this.notificationService.disconnectNotification();
    });

    this.socket.on('status', (status: IStatus) => {
      if (status.count) {
        this.userCount.next(status.count);
      }
      if (status.loginmode) {
        this.loginmode.next(status.loginmode);
      }
      if (status.username) {
        this.username.next(status.username);
      }
    });
  }

  sendMessage(msg: { display_name: string, message: string, token: string }) {
    this.socket.emit('chat_message', msg);
  }

  sendCommand(cmd: { display_name: string, message: string, token: string }) {
    this.socket.emit('chat_command', cmd);
  }

  getMessage(): Observable<IMessage> {
    return this.socket.fromEvent('chat_message');
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
