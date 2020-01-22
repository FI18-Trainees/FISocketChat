import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/services/api.service';
import { ISidebarContent } from 'src/interfaces/ISidebarContent';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {

  public sidebarContent: Observable<ISidebarContent[]>;

  constructor(private api: ApiService) { }

  ngOnInit() {
    this.sidebarContent = this.api.getSidebarContent();
  }

}
