import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class LoggedIn implements CanActivate {

  constructor(
    private authProvider: AuthService,
    private router: Router
  ) { }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (!this.authProvider.isAuthenticated) {
      this.router.navigate(['/']);
      return false;
    }
    return true;
  }
  
}

@Injectable({
  providedIn: 'root'
})
export class NotLoggedIn implements CanActivate {    
  constructor(
    private authProvider: AuthService,
    private router: Router
  ) { }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (this.authProvider.isAuthenticated) {
      this.router.navigate(['profile']);
      return false;
    }
    return true;
  }
}
