import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Subscription } from 'rxjs';
import { SocketService } from 'src/services/socket.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  @Output()
  buttonClick = new EventEmitter();

  connectStatus = false;
  connectText = 'Disconnected';

  statusSub: Subscription;

  constructor(private socketService: SocketService) { }

  ngOnInit() {
    this.statusSub = this.socketService.connectStatus.subscribe((connectStatus: boolean) => {
      this.connectStatus = connectStatus;
      if (connectStatus) {
        this.connectText = 'Connected';
      } else {
        this.connectText = 'Disconnected';
      }
    });
  }
}
