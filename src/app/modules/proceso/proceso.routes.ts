import { Routes } from '@angular/router';

export default [
  {
    path: '',
    redirectTo: 'enviar-entrega-complemento',
    pathMatch: 'full',
  },
  {
    path: 'enviar-entrega-complemento',
    loadComponent: () =>
      import('./componentes/enviar-entrega-complemento/enviar-entrega-complemento.component'),
  }
] as Routes;
