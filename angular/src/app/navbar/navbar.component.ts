import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/services/api.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  usercount: number;

  constructor(private apiService: ApiService) { }

  ngOnInit() {
    this.usercount = this.apiService.getUserlist().length;
  }

}
