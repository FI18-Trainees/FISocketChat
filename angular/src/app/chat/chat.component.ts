import { Component, OnInit, OnDestroy } from '@angular/core';
import { MessageService } from 'src/services/message.service';
import { Subscription } from 'rxjs';
import { IMessage } from 'src/interfaces/IMessage';
import { registerLocaleData } from '@angular/common';
import localDe from '@angular/common/locales/de';
import localDeExtra from '@angular/common/locales/extra/de';
registerLocaleData(localDe, 'de-DE', localDeExtra);

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit, OnDestroy {
  messageList: IMessage[] = [];
  messageSubscription: Subscription;

  constructor(private messageService: MessageService) {
    this.messageSubscription = this.messageService.currentMessage.subscribe(message => this.newMessage(message));
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.messageSubscription.unsubscribe();
  }

  newMessage(messageContent: string) {
    const date: Date = new Date();
    const message: IMessage = {
      content_type: 'message',
      append_allow: true,
      author: {
        username: 'Test',
        display_name: 'Test',
        avatar: 'https://pleated-jeans.com/wp-content/uploads/2019/06/funny-pic-dump-6.3.19-13.jpg',
        chat_color: '#399b2a'
      },
      content: messageContent,
      full_timestamp: date.toLocaleDateString(),
      timestamp: date.toLocaleTimeString(),
      priority: 'low'
    };
    console.log(message.full_timestamp);
    console.log(message.timestamp);
    if (this.messageList.length !== 0) {
      // Check if message can be appended
      if (message.append_allow) {
        // Check if last message is from same user
        if (this.checkLastMessage(message.author.username)) {
          // Add message content and update timestamps
          this.messageList[this.messageList.length - 1].content += message.content;
          this.messageList[this.messageList.length - 1].full_timestamp = message.full_timestamp;
          this.messageList[this.messageList.length - 1].timestamp = message.timestamp;
          return;
        }
        return;
      }
      return;
    }
    this.messageList.push(message);
  }

  checkLastMessage(username: string) {
    if (this.messageList[this.messageList.length - 1].author.username === username) {
      return true;
    }
    return false;
  }
}
