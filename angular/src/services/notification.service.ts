import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  // More info here: https://developer.mozilla.org/de/docs/Web/API/notification

  private notifications = new Array();

  constructor() {
    this.initializeNotifications();
  }

  initializeNotifications(): boolean {
    // Let's check if the browser supports notifications
    if (!('Notification' in window)) {
        alert('This browser does not support desktop notification');
        return;
    } else if (this.checkPermission()) {
    //    If it's okay let's create a notification
    //    new Notification("Welcome back!");
    } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(() => {
            // If the user accepts, let's create a notification
            if (this.checkPermission()) {
                this.displayNotifyMode();
                const testNotification: Notification = new Notification('This is how a notification would appear!');
            }
        });
    }
    // At last, if the user has denied notifications, and you
    // want to be respectful there is no need to bother them any more.
    return this.checkPermission();
  }

  // check if permission to show notification is granted
  checkPermission() {
      // tslint:disable-next-line: no-any
      if (Notification.permission === 'granted') {
          return true;
      } else {
          return false;
      }
  }

  disconnectNotification() {
    if (this.checkPermission()) {
        this.newNotification('You have been disconnected from the chat!');
    }
  }

  // create new notification with the variable "text" as content
  newNotification(text: string) {
    const notification = new Notification(text);
    this.notifications.push(notification);
  }

  displayNotifyMode() {
    if (this.checkPermission() === true) {
        $('#notify-mode').css('display', 'flex');
    } else {
        $('#notify-mode').css('display', 'none');
    }
  }

  closeAllNotifications() {
    if (this.notifications.length > 0) {
        this.notifications.forEach(this.closeNotification);
    }
  }

  closeNotification(item: Notification) {
    item.close();
  }

  // setTimeout(notification.close.bind(notification), 4000);
}
