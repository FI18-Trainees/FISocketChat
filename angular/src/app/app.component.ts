import { Component, OnInit} from '@angular/core';
import * as $ from 'jquery';
import * as io from 'socket.io-client';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

    constructor() {}

    ngOnInit(): void {
    }
}
