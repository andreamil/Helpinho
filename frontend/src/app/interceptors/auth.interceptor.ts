

import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
} from '@angular/common/http';
import { from, Observable, throwError } from 'rxjs';
import { mergeMap, catchError } from 'rxjs/operators';
import { Auth } from 'aws-amplify';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor() {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return from(Auth.currentSession()).pipe(
      mergeMap((session) => {
        const idToken = session.getIdToken().getJwtToken();

        const authReq = request.clone({
          setHeaders: {
            Authorization: idToken,
          },
        });

        return next.handle(authReq);
      }),
      catchError((error) => {

        return next.handle(request);
      })
    );
  }
}
