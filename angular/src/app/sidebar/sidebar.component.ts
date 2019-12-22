import { Component, OnInit } from '@angular/core';
import { ISidebarContent } from 'src/interfaces/ISidebarContent';
import { Observable } from 'rxjs';
import { ApiService } from 'src/services/api.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {

  public sidebarElements: Observable<ISidebarContent[]>;

  constructor(private apiService: ApiService) { }

  ngOnInit() {
    this.sidebarElements = this.apiService.getSidebarContent();
  }
}

