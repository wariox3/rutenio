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
      import('./componentes/despacho-lista/despacho-lista.component'),
  },
  {
    path: 'nuevo',
    loadComponent: () =>
      import('./componentes/despacho-nuevo/despacho-nuevo.component'),
  },
] as Routes;
