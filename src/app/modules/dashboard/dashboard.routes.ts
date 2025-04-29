import { Routes } from '@angular/router';

export default [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: '',
    loadComponent: () => import('./dashboard.component'),
  },
] as Routes;
