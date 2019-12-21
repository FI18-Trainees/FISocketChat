import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { filter, map, debounceTime, take } from 'rxjs/operators';
import { MapOperator } from 'rxjs/internal/operators/map';
import { HttpClient } from '@angular/common/http';
import { ISidebarContent } from 'src/interfaces/ISidebarContent';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private sidebarContent: ISidebarContent[] = null;

  constructor(private httpClient: HttpClient) { }

  getSidebarContent(): Observable<ISidebarContent[]> {
    if (this.sidebarContent == null) {
      return this.httpClient.get<ISidebarContent[]>('/api/sidebar').pipe(
        map(x => {
          this.sidebarContent = x;
          return x;
        })
      );
    }
    return of(this.sidebarContent);
  }
}
