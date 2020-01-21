import { Component, OnInit, OnDestroy } from '@angular/core';
import { MessageService } from 'src/services/message.service';
import { Subscription } from 'rxjs';
import { IMessage } from 'src/interfaces/IMessage';
import { registerLocaleData } from '@angular/common';
import localDe from '@angular/common/locales/de';
import localDeExtra from '@angular/common/locales/extra/de';
import { SocketService } from 'src/services/socket.service';
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

  constructor(private messageService: MessageService, private socketService: SocketService) {
    this.messageSubscription = this.messageService.currentMessage.subscribe(message => this.newMessage(message));
    this.socketSubscription = this.socketService.getMessage().subscribe(recievedMessage => {
      this.addMessage(recievedMessage);
    });
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.messageSubscription.unsubscribe();
    this.socketSubscription.unsubscribe();
  }

  newMessage(messageContent: string) {
    let priority: 'low';
    this.socketService.sendMessage({display_name: 'Test', message: messageContent, token: 'Test'});
  }

  addMessage(msg: IMessage) {
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
        return;
      }
      return;
    }
    this.messageList.push(msg);
  }

  checkLastMessage(username: string) {
    if (this.messageList[this.messageList.length - 1].author.username === username) {
      return true;
    }
    return false;
  }
}
