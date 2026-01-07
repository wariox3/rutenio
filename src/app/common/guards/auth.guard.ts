import { inject } from '@angular/core';
import { Router, type CanMatchFn } from '@angular/router';
import { map } from 'rxjs';
import { AuthService } from '../../modules/auth/services/auth.service';
import { AuthState } from '../../modules/auth/state/auth.state';

export const authGuard: CanMatchFn = (route, segments) => {
    const auth = inject(AuthService);
  const state = inject(AuthState);
  const router = inject(Router);

  if (state.isAuthenticated()) {
    return true;
  }

  return auth.loadUser().pipe(
    map(user => {
      if (user) return true;
      return router.parseUrl('/auth/login');
    })
  );
};
