import { inject } from '@angular/core';
import { Router, type CanMatchFn } from '@angular/router';
import { TokenService } from '../../modules/auth/services/token.service';
import { AuthState } from '../../modules/auth/state/auth.state';

export const authGuard: CanMatchFn = (route, segments) => {
  const state = inject(AuthState);
  const router = inject(Router);

  if (state.isAuthenticated()) {
    return true;
  }

  return router.parseUrl('/auth/login');
};
