import { Routes } from '@angular/router';

export default [
  {
    path: '',
    loadComponent: () => import('./reporte-entregas.component'),
  },
] as Routes;
