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
      import('./componentes/novedad-lista/novedad-lista.component'),
  },
  // {
  //   path: 'nuevo',
  //   loadComponent: () =>
  //     import('./componentes/despacho-nuevo/despacho-nuevo.component'),
  // },
  {
    path: 'detalle/:id',
    loadComponent: () =>
      import('./componentes/novedad-detalle/novedad-detalle.component'),
  },
] as Routes;
