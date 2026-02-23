import { Routes } from '@angular/router';

export default [
  {
    path: '',
    loadComponent: () => import('./dashboard.component'),
  },
] as Routes;
