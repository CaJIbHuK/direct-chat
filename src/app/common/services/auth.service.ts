import {Injectable, Inject} from "@angular/core";
import {Router} from "@angular/router";
import {HttpClient} from "./api.service";
import {UserService} from "./user.service";
import {AuthInfo, User} from "../models/auth.models";
import {SignalService} from "./signalling.service";

@Injectable()
export class AuthService {

  initComplete = false;

  TOKEN_NAME = "token";
  USER_DATA_NAME = "user";

  constructor(@Inject(Router) private router : Router,
              @Inject(SignalService) private signal : SignalService,) {
  }

  generateToken(len = 16) : Promise<string> {
    return Promise.resolve(new Uint8Array((len || 40) / 2))
      .then(arr => window.crypto.getRandomValues(arr) && arr)
      .then(arr => Array.from(arr, el => '0' + el.toString(16).substr(-2)).join(''))
  }


  isAuthenticated() : Promise<boolean> {
    return this.getToken().then(token => !!token);
  }

  getToken() : Promise<string | null> {
    return Promise.resolve(localStorage.getItem(this.TOKEN_NAME));
  }

  setToken(token : string | null) : Promise<void> {
    return Promise.resolve(token)
      .then(token => {
        if (token) {
          localStorage.setItem(this.TOKEN_NAME, token);
        } else {
          localStorage.removeItem(this.TOKEN_NAME);
        }
      });
  }

  getUser() : Promise<User|null> {
    let jsonData = localStorage.getItem(this.USER_DATA_NAME);
    return jsonData ? Promise.resolve(User.fromJSON(jsonData)) : Promise.resolve(null);
  }

  setUser(user) : Promise<void> {
    return Promise.resolve(user)
      .then(user => {
        if (user) {
          localStorage.setItem(this.USER_DATA_NAME, user.toJSON())
        } else {
          localStorage.removeItem(this.USER_DATA_NAME)
        }
      })
  }

  reset() {
    return Promise.all([
      this.setToken(null),
      this.setUser(null)
    ]).then(() => Promise.resolve());
  }

  init(authInfo : AuthInfo) {
    return this.setUser(new User(authInfo));
  }

  signIn(authInfo : AuthInfo) : Promise<{ result : boolean, errors? : { message : string } }> {

    return this.reset()
      .then(() => this.generateToken())
      .then(token => this.setToken(token))
      .then(() => this.init(authInfo))
      .then(() => this.signal.sendLogin(authInfo.name))
      .then(() => new Promise((res, rej) => {
        this.signal.addHandler(data =>
          data.success ? res(data) : rej(data.reason), this.signal.MESSAGE_TYPES.LOGIN)
      }))
      .then(() => ({result : true}))
      .catch(errors => {
        this.reset();
        return ({result : false, errors : errors});
      });
  }

  signOut() : Promise<{ result : boolean, errors? : { message : string } }> {
    return this.reset()
      .then(() => this.router.navigate(['/signin']))
      .then(() => this.signal.sendLogout())
      .then(() => ({result : true}))
      .catch(errors => ({result : false, errors : errors}))
  }

}