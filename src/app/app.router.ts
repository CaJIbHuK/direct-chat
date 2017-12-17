import {NgModule}              from '@angular/core';
import {RouterModule, Routes}  from '@angular/router';
import {PageNotFoundComponent} from "./common/components/pages/404";

const appRoutes : Routes = [
  {path : '', redirectTo : '/signin', pathMatch : 'full'},
  {path : '**', component : PageNotFoundComponent}
];
@NgModule({
  imports : [
    RouterModule.forRoot(appRoutes,  { useHash: true })
  ],
  exports : [
    RouterModule
  ]
})
export class AppRoutingModule {
}