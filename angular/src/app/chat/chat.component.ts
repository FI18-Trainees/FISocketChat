import { Component, OnInit, OnDestroy } from '@angular/core';
import { MessageService } from 'src/services/message.service';
import { Subscription } from 'rxjs';
import { IMessage } from 'src/interfaces/IMessage';

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
    console.log(messageContent);
    const message: IMessage = {
      content_type: 'message',
      append_allow: true,
      author: {
        username: 'Test',
        display_name: 'Test',
        avatar: 'https://lh3.googleusercontent.com/ykuq3KjWWVgwt9fV1zh1ZzAhXJF6pKV5tbUGH0BZIBBP5yIICcavfO-knvLifR1rv0uBiEnlngw=w640-h400-e365',
        chat_color: '#399b2a'
      },
      content: messageContent,
      full_timestamp: '20.01.2020 21:43:55',
      timestamp: '21:43:55',
      priority: 'low'
    };
    this.messageList.push(message);
  }

}
