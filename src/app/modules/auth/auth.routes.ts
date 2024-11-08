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
    path: 'reset-password',
    loadComponent: () =>
      import('./components/recover-password/recover-password.component'),
  },
] as Routes;
