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
  {
    path: 'editar/:id',
    loadComponent: () =>
      import('./componentes/despacho-editar/despacho-editar.component'),
  },
  {
    path: 'detalle/:id',
    loadComponent: () =>
      import('./componentes/despacho-detalle/despacho-detalle.component'),
  },
] as Routes;
