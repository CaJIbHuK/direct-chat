import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AuthGuard} from 'app/common/guards/index';
import {ChatComponent} from "./components/chat.component";

const chatRoutes : Routes = [
  {path : 'chat', component : ChatComponent, canActivate : [AuthGuard]},
];

@NgModule({
  imports : [
    RouterModule.forChild(chatRoutes)
  ],
  exports : [
    RouterModule
  ]
})
export class ChatRoutingModule {
}