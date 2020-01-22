import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  // More info here: https://developer.mozilla.org/de/docs/Web/API/notification

  private notifications = new Array();
  private notificationMode = 'no';
  unreadMessages = 0;

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
                const testNotification: Notification = new Notification('This is how a notification would appear!');
                this.notifications.push(testNotification);
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
    if (this.checkPermission()) {
      const notification = new Notification(text);
      this.notifications.push(notification);
      setTimeout(notification.close.bind(notification), 4000);
    }
  }

  newMessage() {
    if (this.notificationMode === 'all') {
      this.newNotification('You have ' + ++this.unreadMessages + ' unread messages');
    }
  }

  updateNotificationMode(mode: string) {
    this.notificationMode = mode;
  }

  resetUnread() {
    this.unreadMessages = 0;
  }
}
