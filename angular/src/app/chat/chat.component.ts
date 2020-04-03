import { Component, OnInit, OnDestroy } from '@angular/core';
import { MessageService } from 'src/services/message.service';
import { Subscription } from 'rxjs';
import { IMessage } from 'src/interfaces/IMessage';
import { registerLocaleData } from '@angular/common';
import localDe from '@angular/common/locales/de';
import localDeExtra from '@angular/common/locales/extra/de';
import { SocketService } from 'src/services/socket.service';
import { IEmbed } from 'src/interfaces/IEmbed';
import { NotificationService } from 'src/services/notification.service';
import { MessagehistoryService } from 'src/services/messagehistory.service';
import { ApiService } from 'src/services/api.service';
import { take, tap, map } from 'rxjs/operators';
registerLocaleData(localDe, 'de-DE', localDeExtra);

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit, OnDestroy {
  messageList: IMessage[] = [];
  messageSubscription: Subscription;
  socketSubscription: Subscription;

  constructor(private messageService: MessageService, private socketService: SocketService, private notifyService: NotificationService, private apiService: ApiService) { }

  ngOnInit() {
    this.socketService.username.subscribe((username: string) => {
      console.log(username);
      this.apiService.getMessageHistory(username).subscribe((messages: IMessage[]) => {
        messages.forEach((message: IMessage) => {
          this.addMessage(message);
        });
      });
    });
    this.messageSubscription = this.messageService.currentMessage.subscribe(message => this.newMessage(message));
    this.socketSubscription = this.socketService.getMessage().subscribe((recievedMessage: IMessage) => {
      this.addMessage(recievedMessage);
      this.notifyService.newMessage();
    });
  }

  ngOnDestroy() {
    this.messageSubscription.unsubscribe();
    this.socketSubscription.unsubscribe();
  }

  newMessage(messageContent: string) {
    const priority = 'low';
    this.socketService.sendMessage({ display_name: 'Test', message: messageContent, token: 'Test' });
  }

  addMessage(msg: IMessage) {
    msg.content = '<div>' + msg.content + '</div>';

    if (this.messageList.length !== 0) {
      // Check if message can be appended
      if (msg.append_allow) {
        // Check if last message is from same user
        if (this.checkLastMessage(msg.author.username)) {
          // Add message content and update timestamps
          this.messageList[this.messageList.length - 1].content += msg.content;
          this.messageList[this.messageList.length - 1].full_timestamp = msg.full_timestamp;
          this.messageList[this.messageList.length - 1].timestamp = msg.timestamp;
          return;
        }
      }
    }
    this.messageList.push(msg);
  }

  addEmbed(embed: IEmbed) {

  }

  checkLastMessage(username: string) {
    if (this.messageList[this.messageList.length - 1].author.username === username) {
      return true;
    }
    return false;
  }
}
