import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'contenedor',
    pathMatch: 'full',
  },
  {
    path: 'auth',
    loadChildren: () => import('./modules/auth/auth.routes'),
  },
  {
    path: '',
    loadChildren: () => import('./pages/pages.routes'),
  },
  { path: '**', redirectTo: 'auth' },
];
