import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpClient
} from '@angular/common/http';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { tap, filter, switchMap, take, map } from 'rxjs/operators';

import { JwtHelperService } from '@auth0/angular-jwt';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {

  constructor(
    private http: HttpClient
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (request.url.includes('refresh')) {
      return next.handle(request);
    }
    let token = localStorage.getItem('access_token');
    if (!token) return next.handle(request);

    const jwtHelper = new JwtHelperService();
    const isExpired = jwtHelper.isTokenExpired(token);
    if (isExpired) {
      return this.refreshToken().pipe(
        switchMap(token => {
          return next.handle(
            request.clone({
              headers: request.headers.set('Authorization', 'Bearer ' + token)
            })
          );
        })
      );
    } else {
      return next.handle(
        request.clone({
          headers: request.headers.set('Authorization', 'Bearer ' + token)
        })
      ); 
    }
  }

  refreshToken(): Observable<any> {
    const refresh = localStorage.getItem('refresh_token');
    return this.http.post('auth/jwt/refresh/', { refresh })
      .pipe(
        map((res: any) => {
          localStorage.setItem('access_token', res.access);
          return res.access;
        })
      );
  }

}
