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
      import('./componentes/vehiculo-lista/vehiculo-lista.component'),
  },
  {
    path: 'nuevo',
    loadComponent: () =>
      import('./componentes/vehiculo-nuevo/vehiculo-nuevo.component'),
  },
] as Routes;
