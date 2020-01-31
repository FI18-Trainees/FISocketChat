import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MatCardModule,
         MatSidenavModule,
         MatFormFieldModule,
         MatSelectModule,
         MatCheckboxModule,
         MatButtonModule,
         MatChipsModule,
         MatInputModule,
         MatIconModule,
         MatToolbarModule,
         MatGridListModule,
         MatSnackBarModule,
} from '@angular/material';
import { FlexLayoutModule } from '@angular/flex-layout';
import { DeviceDetectorModule } from 'ngx-device-detector';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavbarComponent } from './navbar/navbar.component';
import { NotificationModeComponent } from './sidebar/notification-mode/notification-mode.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ChatComponent } from './chat/chat.component';
import { InputComponent } from './input/input.component';
import { MessageComponent } from './chat/message/message.component';
import { EmoteMenuComponent } from './input/emote-menu/emote-menu.component';
import { FormsModule } from '@angular/forms';
import { SocketService } from 'src/services/socket.service';
import { SocketIoModule, SocketIoConfig, Socket } from 'ngx-socket-io';
import { EmbedComponent } from './chat/embed/embed.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { CookieService } from 'ngx-cookie-service';

const config: SocketIoConfig = { url: 'localhost:5000', options: { secure: true, transports: ['polling', 'websocket'], query: 'token=' + ('access_token')} };

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    NotificationModeComponent,
    ChatComponent,
    InputComponent,
    MessageComponent,
    EmoteMenuComponent,
    EmbedComponent,
    SidebarComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    NgbModule,
    BrowserAnimationsModule,
    DeviceDetectorModule.forRoot(),
    MatCardModule,
    MatSidenavModule,
    MatFormFieldModule,
    MatSelectModule,
    MatCheckboxModule,
    MatButtonModule,
    MatChipsModule,
    MatInputModule,
    MatIconModule,
    MatToolbarModule,
    FlexLayoutModule,
    MatGridListModule,
    FormsModule,
    MatSnackBarModule,
    SocketIoModule.forRoot(config),
  ],
  providers: [{ provide: SocketService, useValue: new SocketService(new Socket(config)) }, CookieService],
  bootstrap: [AppComponent]
})
export class AppModule { }