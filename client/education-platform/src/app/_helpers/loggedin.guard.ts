import { Injectable } from "@angular/core";

import { AuthenticationService, ToastService } from "../_services";
import {
  CanActivate,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  CanActivateChild,
} from "@angular/router";

@Injectable({ providedIn: "root" })
export class LoggedInGuard implements CanActivate, CanActivateChild {
  constructor(
    private router: Router,
    private authenticationService: AuthenticationService,
    private toastService: ToastService
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    if (this.authenticationService.isLoggedIn) {
      return true;
    } else {
      this.toastService.info("Bitte logge dich ein");
      this.router.navigate(["account/login"], {
        queryParams: { returnUrl: state.url },
      });
      return false;
    }
  }
  canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.canActivate(route, state);
  }
}

@Injectable({ providedIn: "root" })
export class NotLoggedInGuard implements CanActivate, CanActivateChild {
  constructor(
    private router: Router,
    private authenticationService: AuthenticationService,
    private toastService: ToastService
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    if (!this.authenticationService.isLoggedIn) {
      return true;
    } else {
      this.toastService.info("Bitte logge dich ein");
      this.router.navigate(["account/login"], {
        queryParams: { returnUrl: state.url },
      });
      return false;
    }
  }
  canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.canActivate(route, state);
  }
}
