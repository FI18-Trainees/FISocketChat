import { Component, OnInit, HostListener} from '@angular/core';
import { NotificationService } from 'src/services/notification.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

    constructor(private notifyService: NotificationService) {}

    ngOnInit(): void {
    }

    @HostListener('window:focus', ['$event'])
    onFocus(event: any): void {
      this.notifyService.resetUnread();
    }

    @HostListener('window:blur', ['$event'])
    onBlur(event: any): void {
      // Do something
    }
}
