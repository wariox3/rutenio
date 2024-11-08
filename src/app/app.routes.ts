import { Routes } from '@angular/router';
import { authGuard } from './common/guards/auth.guard';

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
