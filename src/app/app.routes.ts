import { Routes } from '@angular/router';
import { publicGuard } from './common/guards/public.guard';
import { authGuard } from './common/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'contenedor',
    pathMatch: 'full',
  },
  {
    path: 'auth',
    canActivate: [publicGuard],
    loadChildren: () => import('./modules/auth/auth.routes'),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadChildren: () => import('./pages/pages.routes'),
  },
  { path: '**', redirectTo: 'auth' },
];
