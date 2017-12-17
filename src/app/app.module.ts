import {NgModule} from "@angular/core";
import {HttpModule} from "@angular/http";
import {BrowserModule} from "@angular/platform-browser";
import NgbModule from "@ng-bootstrap/ng-bootstrap";
import {AppRoutingModule} from "./app.router";
import {AppComponent} from "./app.component";
import {ContextmenuModule} from "ng2-contextmenu";

import {AuthModule} from "auth/auth.module";
import {ChatModule} from "chat/chat.module";
import {SharedModule} from "shared/shared.module";

import * as COMMON_SERVICES from "./common/services/index";
import * as COMMON_GUARDS from "./common/guards/index";
import * as COMMON_COMPONENTS from "./common/components/index";
const commonServices = Object.keys(COMMON_SERVICES).map(key => COMMON_SERVICES[key]);

const commonGuards = Object.keys(COMMON_GUARDS).map(key => COMMON_GUARDS[key]);

const commonComponents = Object.keys(COMMON_COMPONENTS).map(key => COMMON_COMPONENTS[key]);

@NgModule({
  imports : [
    BrowserModule,
    HttpModule,
    NgbModule.NgbModule.forRoot(),
    ContextmenuModule,
    SharedModule,
    AuthModule,
    ChatModule,
    AppRoutingModule
  ],
  declarations : [
    commonComponents,
    AppComponent
  ],
  providers : [
    commonServices,
    commonGuards
  ],
  bootstrap : [
    AppComponent
  ]
})
export class AppModule {
}