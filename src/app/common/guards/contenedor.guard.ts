import { inject } from '@angular/core';
import { Router, type CanMatchFn } from '@angular/router';
import { getCookie } from 'typescript-cookie';

export const contenedorGuard: CanMatchFn = (route, segments) => {
  const router = inject(Router);
  const contenedor = getCookie('contenedor');

  if (!contenedor) {
    router.navigate(['/contenedor/lista']);
    return false;
  }

  return true;
};
