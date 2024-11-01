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
      import('./componentes/contacto-lista/contacto-lista.component'),
  },
  {
    path: 'nuevo',
    loadComponent: () =>
      import('./componentes/contacto-nuevo/contacto-nuevo.component'),
  },
] as Routes;
