import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SitebarComponent } from './sitebar/sitebar.component';
import { ChatContainerComponent } from './chat-container/chat-container.component';
import { NavbarComponent } from './navbar/navbar.component';
import { MessageContainerComponent } from './chat-container/message-container/message-container.component';
import { InputContainerComponent } from './input-container/input-container.component';
import { MessageProfileImageComponent } from './chat-container/message-container/message-profile-image/message-profile-image.component';
import { MessageHeaderComponent } from './chat-container/message-container/message-header/message-header.component';
import { MessageContentComponent } from './chat-container/message-container/message-content/message-content.component';

@NgModule({
  declarations: [
    AppComponent,
    SitebarComponent,
    ChatContainerComponent,
    NavbarComponent,
    MessageContainerComponent,
    InputContainerComponent,
    MessageProfileImageComponent,
    MessageHeaderComponent,
    MessageContentComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
