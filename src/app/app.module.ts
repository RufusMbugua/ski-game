import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { GameComponent } from './game/game.component';
import { NgxSmartModalModule } from 'ngx-smart-modal';
import {NgxLocalStorageModule} from 'ngx-localstorage';

@NgModule({
  declarations: [
    AppComponent,
    GameComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgxSmartModalModule.forRoot(),
    NgxLocalStorageModule.forRoot({prefix: 'score'})
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
