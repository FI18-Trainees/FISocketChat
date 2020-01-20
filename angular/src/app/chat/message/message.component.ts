import { Component, OnInit, Input } from '@angular/core';
import { IMessage } from 'src/interfaces/IMessage';

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.scss']
})
export class MessageComponent implements OnInit {

  @Input()message: IMessage;

  constructor() { }

  ngOnInit() {
  }

}
