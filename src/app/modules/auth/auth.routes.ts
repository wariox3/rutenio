import { Routes } from '@angular/router';

export default [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('./components/login/login.component'),
  },
  {
    path: 'register',
    loadComponent: () => import('./components/register/register.component'),
  },
  {
    path: 'login/:token',
    loadComponent: () => import('./components/login/login.component'),
  },
  {
    path: 'reset-password',
    loadComponent: () =>
      import('./components/recover-password/recover-password.component'),
  },
  {
    path: 'verificacion/:token',
    loadComponent: () =>
      import('./components/verificacion-cuenta/verificacion-cuenta.component'),
  },
  {
    path: 'clave/cambiar/:token',
    loadComponent: () =>
      import('./components/reiniciar-clave/reiniciar-clave.component'),
  },
] as Routes;
