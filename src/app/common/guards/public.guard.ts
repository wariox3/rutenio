import { inject } from "@angular/core";
import { Router, type CanActivateFn } from "@angular/router";
import { AuthState } from "../../modules/auth/state/auth.state";

export const publicGuard: CanActivateFn = () => {
  const state = inject(AuthState);
  const router = inject(Router);

  if (state.isAuthenticated()) {
    return router.parseUrl('/');
  }

  return true;
};
