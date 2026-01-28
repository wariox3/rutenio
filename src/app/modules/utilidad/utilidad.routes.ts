import { Routes } from '@angular/router';

export default [
  {
    path: '',
    redirectTo: 'decodificar-direccion',
    pathMatch: 'full',
  },
  {
    path: 'decodificar-direccion',
    loadComponent: () =>
      import('./componentes/decodificar-direccion/decodificar-direccion.component'),
  },
] as Routes;
