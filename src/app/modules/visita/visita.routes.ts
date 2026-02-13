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
      import('./componentes/visita-lista/visita-lista.component'),
  },
  {
    path: 'nuevo',
    loadComponent: () =>
      import('./componentes/visita-nuevo/visita-nuevo.component'),
  },
  {
    path: 'editar/:id',
    loadComponent: () =>
      import('./componentes/visita-editar/visita-editar.component'),
  },
  {
    path: 'detalle/:id',
    loadComponent: () =>
      import('./componentes/visita-detalle/visita-detalle.component'),
  },
] as Routes;
