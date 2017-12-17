import {Component, Inject, OnInit} from "@angular/core";
import {AuthService} from "app/common/services/auth.service";
import css from "./navbar.component.css!text";

@Component({
  selector : 'navigation-bar',
  template : `
      <nav class="navbar navbar-toggleable-md navbar-inverse bg-inverse">
          <span id="username" class="nav-item mr-auto">{{title}}</span>
          <button class="btn btn-link" (click)="signOut()"><i class="fa fa-sign-out" aria-hidden="true"></i>Log Out</button>
      </nav>
  `,
  styles : [css]
})
export class NavigationBarComponent implements OnInit {

  title: string = "";

  constructor(@Inject(AuthService) private auth : AuthService) {}

  ngOnInit() : void {
    this.auth.getUser().then(user => {
      this.title = user.name;
    })
  }

  signOut() {
    this.auth.signOut();
  }
}