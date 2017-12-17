import {NgModule} from '@angular/core';
import {CommonModule} from "@angular/common";
import {FormsModule} from "@angular/forms";
import NgbModule from "@ng-bootstrap/ng-bootstrap";
import {AuthRoutingModule} from "./auth.router";

import * as COMPONENTS from "./components/index";
const components = Object.keys(COMPONENTS).map(key => COMPONENTS[key]);

@NgModule({
  imports : [
    CommonModule,
    FormsModule,
    NgbModule.NgbModule,
    AuthRoutingModule
  ],
  providers : [
  ],
  declarations : [
    components
  ],
  exports : []
})
export class AuthModule {}
