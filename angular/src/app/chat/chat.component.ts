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
import { ApiService } from 'src/services/api.service';
registerLocaleData(localDe, 'de-DE', localDeExtra);

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit, OnDestroy {
  messageList: Array<IMessage | IEmbed> = [];
  messageSubscription: Subscription;
  socketSubscription: Subscription;

  constructor(private messageService: MessageService, private socketService: SocketService, private notifyService: NotificationService, private apiService: ApiService) { }

  ngOnInit() {
    this.socketService.username.subscribe((username: string) => {
      this.apiService.getMessageHistory(username).subscribe((messages: IMessage[]) => {
        messages.forEach((message: IMessage) => {
          switch (message.content_type) {
            case 'message':
              this.addMessage(message);
              break;
            case 'embed':
              this.addEmbed(message as IEmbed);
              break;
            default:
              throw new Error('Invalid message type!');
          }

        });
      });
    });
    this.socketSubscription = this.socketService.getMessage().subscribe((recievedMessage: IMessage) => {
      this.addMessage(recievedMessage);
      this.notifyService.newMessage();
    });
  }

  ngOnDestroy() {
    this.socketSubscription.unsubscribe();
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
    this.messageList.push(embed);
  }

  checkLastMessage(username: string) {
    if (this.messageList[this.messageList.length - 1].author.username === username) {
      return true;
    }
    return false;
  }
}
