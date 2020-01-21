import { Component, OnInit, Input } from '@angular/core';
import { IMessage } from 'src/interfaces/IMessage';
import { MessageService } from 'src/services/message.service';

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.scss']
})
export class MessageComponent implements OnInit {

  @Input()message: IMessage;

  constructor(private messageService: MessageService) { }

  ngOnInit() {
  }

  displayNameClick(event: KeyboardEvent) {
    if (event.ctrlKey) {
      this.messageService.usernameClicked(this.message.author.username);
    }
  }
}
