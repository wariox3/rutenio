import { Routes } from '@angular/router';

export default [
  {
    path: '',
    redirectTo: 'lista',
    pathMatch: 'full',
  },
  {
    path: 'lista',
    loadComponent: () =>
      import('./componentes/franja-lista/franja-lista.component'),
  },
  {
    path: 'nuevo',
    loadComponent: () =>
      import('./componentes/franja-nuevo/franja-nuevo.component'),
  },
] as Routes;
