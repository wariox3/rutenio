import { HttpContext, HttpContextToken, type HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthState } from '../../modules/auth/state/auth.state';

  const requiereToken = new HttpContextToken<boolean>(()=> true)
  
  export function noRequiereToken(){
    return new HttpContext().set(requiereToken, false)
  }


export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const state = inject(AuthState);

  const request = req.clone({
    withCredentials: true,
  });

  return next(request).pipe(
    catchError(err => {
      if (err.status === 401 && state.isAuthenticated()) {
        state.clear();
        router.navigate(['/auth/login']);
      }
      return throwError(() => err);
    })
  );
};
