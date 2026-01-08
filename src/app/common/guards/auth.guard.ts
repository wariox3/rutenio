import { inject } from '@angular/core';
import { Router, type CanMatchFn } from '@angular/router';
import { TokenService } from '../../modules/auth/services/token.service';

export const authGuard: CanMatchFn = (route, segments) => {
  const tokenValido = inject(TokenService).validarToken();

  const router = inject(Router);

  if (tokenValido) {
    return true;
  }

  router.navigate(['/auth']);
  return false;
};
