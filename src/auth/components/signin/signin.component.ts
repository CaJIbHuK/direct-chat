import {Component, Inject} from "@angular/core";
import {Router} from "@angular/router";
import {AuthService} from "app/common/services/index";
import css from "./signin.component.css!text";
import commonCss from "../common/auth.component.css!text";

@Component({
  selector : 'signin',
  template : `
      <div class="container signin-container modal-auth-container"><h1>Sign in to Chat</h1><br>
          <form (ngSubmit)="onSubmit()" class="signin-form" novalidate #form="ngForm">
              <div class="signin-form-body">
                  <ngb-alert *ngIf="error" (close)="error=false" [type]="'danger'">{{texts.error}}</ngb-alert>
                  <div class="form-group"><input class="form-control" type="text" id="name" placeholder="Enter your name"
                                                 [disabled]="loading" name="name" [(ngModel)]="name" required></div>
              </div>
              <div class="signin-form-buttons">
                  <button class="btn btn-success" [disabled]="loading" type="submit">Sign In</button>
              </div>
          </form>
      </div>    `,
  styles : [css, commonCss]
})
export class SignInComponent {

  loading : boolean;
  name : string;
  error : boolean = false;
  texts = {
    error : "Cannot connect to chat."
  };

  constructor(@Inject(AuthService) private auth : AuthService,
              @Inject(Router) private router : Router
  ) {}

  onSubmit() {
    this.loading = true;
    this.auth.signIn({name : this.name})
      .then(() => this.loading = false)
      .then(() => this.router.navigate(['/chat']))
  }

}