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
  {
    path: 'editar/:id',
    loadComponent: () =>
      import('./componentes/contacto-editar/contacto-editar.component'),
  },
  {
    path: 'detalle/:id',
    loadComponent: () =>
      import('./componentes/contacto-detalle/contacto-detalle.component'),
  },
] as Routes;
