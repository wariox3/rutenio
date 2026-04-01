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
      import('./components/contenedor-lista/contenedor-lista.component'),
  },
  {
    path: 'nuevo',
    loadComponent: () =>
      import('./components/contenedor-nuevo/contenedor-nuevo.component'),
  },
] as Routes;
