import { BrowserModule } from '@angular/platform-browser';
import { NgModule, Injectable } from '@angular/core';
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
import { DeviceDetectorModule, DeviceDetectorService } from 'ngx-device-detector';


import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavbarComponent } from './navbar/navbar.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { SidebarElementComponent } from './sidebar/sidebar-element/sidebar-element.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ChatComponent } from './chat/chat.component';
import { InputComponent } from './input/input.component';
import { MessageComponent } from './chat/message/message.component';
import { EmoteMenuComponent } from './input/emote-menu/emote-menu.component';
import { MessageService } from 'src/services/message.service';
import { FormsModule } from '@angular/forms';
import { ErrorInfoService } from 'src/services/error-info.service';
import { SocketService } from 'src/services/socket.service';
import { SocketIoModule, SocketIoConfig, Socket } from 'ngx-socket-io';

const config: SocketIoConfig = { url: 'localhost:5000', options: { secure: true, transports: ['polling', 'websocket'], query: 'token=' + ('access_token')} };

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    SidebarComponent,
    SidebarElementComponent,
    ChatComponent,
    InputComponent,
    MessageComponent,
    EmoteMenuComponent,
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
  providers: [DeviceDetectorService, MessageService, ErrorInfoService, { provide: SocketService, useValue: new SocketService(new Socket(config)) }],
  bootstrap: [AppComponent]
})
export class AppModule { }
