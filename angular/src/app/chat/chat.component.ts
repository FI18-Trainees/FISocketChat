import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatSidenavContainer } from '@angular/material';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit, AfterViewInit {

  @ViewChild(MatSidenavContainer, {static: false}) sidenavContainer: MatSidenavContainer;

  constructor() { }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.sidenavContainer.scrollable.elementScrolled().subscribe(() => {/* react to scroll events */});
  }

}
