import { Component, OnInit, ViewChild, ElementRef, OnDestroy, AfterViewInit} from '@angular/core';
import { DeviceDetectorService } from 'ngx-device-detector';
import { MessageService } from 'src/services/message.service';
import { Subscription } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ErrorInfoService } from 'src/services/error-info.service';

@Component({
  selector: 'app-input',
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.scss']
})
export class InputComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('messageInput', {static: false}) messageInput: HTMLTextAreaElement;

  messageContent = '';

  mobileClient = true;
  emoteSubscription: Subscription;

  constructor(private deviceService: DeviceDetectorService, private messageService: MessageService, private errorinfoService: ErrorInfoService) {
    if (this.deviceService.isDesktop()) {
      this.mobileClient = false;
    }
    this.messageService.clickedUsername.subscribe(username => this.addUsername(username));
  }

  ngOnInit() { }

  ngOnDestroy() {
    this.emoteSubscription.unsubscribe();
  }

  ngAfterViewInit() { }

  checkPressedKey(event: KeyboardEvent) {
    // disables default behaviour
    event.preventDefault();
    switch (event.key) {
      case 'Enter':
        if (event.shiftKey && !(event.altKey || event.ctrlKey)) {
          console.log('newline');
          break;
        }
        this.formSubmit();
        break;
    }
  }

  formSubmit() {
    const message: string = this.messageContent;
    this.clearInput();
    if (message.trim()) {
      this.messageService.newMessage(message);
      return;
    }
    this.errorinfoService.showError('Invalid message!');
  }

  clearInput() {
    this.messageContent = '';
  }

  addEmote(emoteKey: string) {
    this.messageContent += emoteKey;
  }

  addUsername(username: string) {
    this.messageContent += '@' + username + ' ';
  }
}
