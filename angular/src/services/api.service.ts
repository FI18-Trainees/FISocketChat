import { Injectable } from '@angular/core';
import { Observable, of, Subject } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { ISidebarContent } from 'src/interfaces/ISidebarContent';
import { IMessage } from 'src/interfaces/IMessage';
import { IEmoteResponse } from 'src/interfaces/IEmoteResponse';

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

  getMessageHistory(ownusername: string): IMessage[] {
    let result: IMessage[];
    this.httpClient.get<IMessage[]>('/api/chathistory?username=$(ownusername)').pipe(
      map(x => {
        result = x;
      })
    );
    if (result.length === 0) {
      this.httpClient.get<IMessage[]>('/api/chathistory').pipe(
        map(x => {
          result = x;
        })
      );
      if (result.length > 0) {
        return result;
      }
    }
  }

  getCommands(): string[] {
    let result: string[];
    this.httpClient.get<string[]>('/api/commands').pipe(
      map(x => {
        result = x;
      })
    );
    return result;
  }

  getUserlist(): string[] {
    let result: string[];
    this.httpClient.get<string[]>('/api/user').pipe(
      map(x => {
        result = x;
      })
    );
    result.push('everyone');
    return result;
  }

  getEmotes() {
    /*
    const result: IEmoteResponse[] = [];
    this.httpClient.get('/api/emotes').subscribe(x => {
      Object.keys(x).forEach(emote => {
        const value = x[emote];
        result.push({
          name: emote,
          value: {
            replace: value[0],
            menuDisplay: value[1],
            menuDisplayCode: value[2]
          }
        });
        console.log(result.length);
      });
    });
    // this.emoteSubject.next();
    return result;
    */
    return this.httpClient.get('/api/emotes').pipe(
      tap((emotes) => emotes)
    );
  }
}
