import {Inject, Injectable} from '@angular/core';
import {Router, CanActivate} from '@angular/router';
import {AuthService, StoragesService} from "../services/index";

@Injectable()
export class AuthGuard implements CanActivate {

  constructor(@Inject(Router) private router : Router,
              @Inject(AuthService) private authService : AuthService) {
  }

  canActivate() : Promise<boolean> {
    return this.authService.isAuthenticated()
      .then(isAuthed => {
        isAuthed || this.router.navigate(['/signin']);
        return isAuthed
      })
  }
}

@Injectable()
export class NotAuthGuard implements CanActivate {

  constructor(@Inject(Router) private router : Router,
              @Inject(AuthService) private authService : AuthService) {}

  canActivate() : Promise<boolean> {
    return this.authService.isAuthenticated()
      .then(isAuthed => {
        isAuthed && this.router.navigate(['/chat']);
        return !isAuthed
      })
  }
}