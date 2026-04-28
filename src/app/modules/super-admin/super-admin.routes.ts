import { Routes } from '@angular/router';
import { superAdminGuard } from './guards/super-admin.guard';

export default [
  {
    path: '',
    redirectTo: 'contenedores',
    pathMatch: 'full',
  },
  {
    path: 'contenedores',
    canActivate: [superAdminGuard],
    loadComponent: () =>
      import('./components/contenedores-global/contenedores-global.component'),
  },
] as Routes;
