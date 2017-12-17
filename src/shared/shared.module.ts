import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import  * as COMMON_COMPONENTS from "./components/index";
const commonComponents = Object.keys(COMMON_COMPONENTS).map(key => COMMON_COMPONENTS[key]);

@NgModule({
  imports : [
    CommonModule
  ],
  declarations : [
    commonComponents
  ],
  providers : [
  ],
  exports : [
    commonComponents
  ]
})
export class SharedModule {}