import { Routes } from '@angular/router';
import { IndexComponent } from './pages/index/index.component';

export const routes: Routes = [
  { path: 'dashboard', component: IndexComponent, pathMatch: 'full' },
  {
    path: 'auth',
    loadChildren: () => import('./modules/auth/auth.routes'),
  },
  {
    path: '',
    loadChildren: () => import('./pages/pages.routes'),
  },
];
