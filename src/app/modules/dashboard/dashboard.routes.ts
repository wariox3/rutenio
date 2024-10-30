import { Routes } from '@angular/router';

export default [
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard.component'),
  },
] as Routes;
