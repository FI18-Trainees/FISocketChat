import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { ChatContainerComponent } from './chat-container/chat-container.component';
import { NavbarComponent } from './navbar/navbar.component';
import { MessageContainerComponent } from './chat-container/message-container/message-container.component';
import { InputContainerComponent } from './input-container/input-container.component';
import { MessageProfileImageComponent } from './chat-container/message-container/message-profile-image/message-profile-image.component';
import { MessageHeaderComponent } from './chat-container/message-container/message-header/message-header.component';
import { MessageContentComponent } from './chat-container/message-container/message-content/message-content.component';
import { SidebarContentComponent } from './sidebar/sidebar-content/sidebar-content.component';
import { NotificationService } from 'src/services/notification.service';
import { ApiService } from 'src/services/api.service';

@NgModule({
  declarations: [
    AppComponent,
    SidebarComponent,
    ChatContainerComponent,
    NavbarComponent,
    MessageContainerComponent,
    InputContainerComponent,
    MessageProfileImageComponent,
    MessageHeaderComponent,
    MessageContentComponent,
    SidebarContentComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule
  ],
  providers: [NotificationService, ApiService],
  bootstrap: [AppComponent]
})
export class AppModule { }
