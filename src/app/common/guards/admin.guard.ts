import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { getCookie } from 'typescript-cookie';
import { jwtDecode } from 'jwt-decode';

export const adminGuard: CanActivateFn = () => {
  const router = inject(Router);
  const token = getCookie('admin_token');

  if (!token) {
    router.navigate(['/admin/login']);
    return false;
  }

  try {
    const decoded: any = jwtDecode(token);
    const ahora = new Date().getTime() / 1000;
    if (decoded.exp && decoded.exp > ahora) {
      return true;
    }
  } catch {}

  router.navigate(['/admin/login']);
  return false;
};
