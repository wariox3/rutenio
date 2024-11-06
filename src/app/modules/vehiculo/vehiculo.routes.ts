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
  {
    path: 'editar/:id',
    loadComponent: () =>
      import('./componentes/vehiculo-editar/vehiculo-editar.component'),
  },
  {
    path: 'detalle/:id',
    loadComponent: () =>
      import('./componentes/vehiculo-detalle/vehiculo-detalle.component'),
  },
] as Routes;
