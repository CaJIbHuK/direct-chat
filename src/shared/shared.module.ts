import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import  * as COMMON_PIPES from "./pipes/index";
const commonPipes = Object.keys(COMMON_PIPES).map(key => COMMON_PIPES[key]);

import  * as COMMON_COMPONENTS from "./components/index";
const commonComponents = Object.keys(COMMON_COMPONENTS).map(key => COMMON_COMPONENTS[key]);

@NgModule({
  imports : [
    CommonModule
  ],
  declarations : [
    commonPipes,
    commonComponents
  ],
  providers : [
    commonPipes
  ],
  exports : [
    commonPipes,
    commonComponents
  ]
})
export class SharedModule {}