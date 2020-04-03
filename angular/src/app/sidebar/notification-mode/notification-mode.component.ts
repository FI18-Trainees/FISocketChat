import { Component, OnInit } from '@angular/core';
import { NotificationService } from 'src/services/notification.service';
import { CookieService } from 'ngx-cookie-service';
import { MatSelectChange } from '@angular/material/select';
import { MessageService } from 'src/services/message.service';

@Component({
  selector: 'app-notification-mode',
  templateUrl: './notification-mode.component.html',
  styleUrls: ['./notification-mode.component.scss']
})
export class NotificationModeComponent implements OnInit {

  notificationPermission = true;
  notificationMode = 'no';

  constructor(private notifyService: NotificationService, private cookieService: CookieService) {
    this.notificationPermission = this.notifyService.checkPermission();
    if (this.notificationPermission) {
      const cookieValue: string = this.cookieService.get('notificationMode');
      if (cookieValue !== '') {
        this.notificationMode = cookieValue;
        notifyService.updateNotificationMode(cookieValue);
      }
    }
  }

  ngOnInit() { }

  newSelection(event: MatSelectChange) {
    this.cookieService.set('notificationMode', event.value, 365, '/', '', false, 'Strict');
    this.notifyService.updateNotificationMode(event.value);
  }
}
