import { Component, OnInit, ViewChild, ElementRef, Output, EventEmitter} from '@angular/core';
import { DeviceDetectorService } from 'ngx-device-detector';
import { MessageService } from 'src/services/message.service';

@Component({
  selector: 'app-input',
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.scss']
})
export class InputComponent implements OnInit {
  @ViewChild('messageInput', {static: false}) messageInput: ElementRef;

  mobileClient = true;

  constructor(private deviceService: DeviceDetectorService, private messageService: MessageService) {
    if (this.deviceService.isDesktop()) {
      this.mobileClient = false;
    }
  }

  ngOnInit() { }

  checkPressedKey(event: KeyboardEvent) {
    // disables default behaviour
    event.preventDefault();
    switch (event.key) {
      case 'Enter':
        if (event.shiftKey && !(event.altKey || event.ctrlKey)) {
          console.log('newline');
          break;
        }
        console.log('formSubmit');
        this.formSubmit();
        break;
    }
  }

  formSubmit() {
    const message: string = this.messageInput.nativeElement.value;
    this.clearInput();
    if (message.trim()) {
      this.messageService.newMessage(message);
      return;
    }
    console.log('Invalid message!');
  }

  clearInput() {
    this.messageInput.nativeElement.value = '';
  }
}
