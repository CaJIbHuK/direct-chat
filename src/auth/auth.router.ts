import {NgModule} from "@angular/core";
import {RouterModule, Routes} from "@angular/router";
import {SignInComponent} from "./components/index";

const authRoutes : Routes = [
  {path : 'signin', component : SignInComponent},
];

@NgModule({
  imports : [
    RouterModule.forChild(authRoutes)
  ],
  exports : [
    RouterModule
  ]
})
export class AuthRoutingModule {
}