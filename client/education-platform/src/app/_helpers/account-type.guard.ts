import { Injectable } from "@angular/core";

import { AuthenticationService, ToastService } from "../_services";
import {
  CanActivate,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  CanActivateChild,
} from "@angular/router";

/**
 * for sites which require a student account
 */
@Injectable({ providedIn: "root" })
export class StudentGuard implements CanActivate, CanActivateChild {
  constructor(
    private router: Router,
    private authenticationService: AuthenticationService,
    private toastService: ToastService
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const currentUser = this.authenticationService.currentUserValue;
    if (currentUser) {
      if (currentUser.studentdata) {
        return true;
      } else {
        this.toastService.error(
          "Вы должны иметь учетную запись студента, чтобы попасть сюда"
        );
        return false;
      }
    } else {
      this.toastService.info("Пожалуйста, войдите");
      this.router.navigate(["account/login/"], {
        queryParams: { returnUrl: state.url },
      });
      return false;
    }
  }

  canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.canActivate(route, state);
  }
}

/**
 * for sites which require a verified teacher account
 */
@Injectable({ providedIn: "root" })
export class TeacherGuard implements CanActivate, CanActivateChild {
  constructor(
    private router: Router,
    private authenticationService: AuthenticationService,
    private toastService: ToastService
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const currentUser = this.authenticationService.currentUserValue;
    if (currentUser) {
      if (currentUser.teacherdata) {
        if (currentUser.teacherdata.verified) {
          return true;
        } else {
          this.toastService.error(
            "Ваша учетная запись должна быть подтверждена, чтобы получить здесь"
          );
          return false;
        }
      } else {
        this.toastService.error(
          "Вы должны иметь учительский аккаунт, чтобы попасть сюда"
        );
        return false;
      }
    } else {
      this.toastService.info("Пожалуйста, войдите");
      this.router.navigate(["account/login/"], {
        queryParams: { returnUrl: state.url },
      });
      return false;
    }
  }

  canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.canActivate(route, state);
  }
}
