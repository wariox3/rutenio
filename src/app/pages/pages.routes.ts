import { Routes } from '@angular/router';

export default [
  {
    path: 'contenedor',
    loadComponent: () => import('./contenedor-layout/contenedor-layout.component'),
    children: [
      {
        path: '',
        loadChildren: () => import('../modules/contenedores/contenedor.routes'),
      },
    ],
  },
  {
    path: 'admin',
    loadComponent: () => import('./admin-layout/admin-layout.component'),
    children: [
      {
        path: '',
        loadChildren: () => import('../modules/dashboard/dashboard.routes'),
      },
      {
        path: 'contacto',
        loadChildren: () => import('../modules/contacto/contacto.routes'),
      },
      {
        path: 'despacho',
        loadChildren: () => import('../modules/despacho/despacho.routes'),
      },
      {
        path: 'franja',
        loadChildren: () => import('../modules/franja/franja.routes'),
      },
      {
        path: 'trafico',
        loadChildren: () => import('../modules/trafico/trafico.routes'),
      },
      {
        path: 'vehiculo',
        loadChildren: () => import('../modules/vehiculo/vehiculo.routes'),
      },
      {
        path: 'visita',
        loadChildren: () => import('../modules/visita/visita.routes'),
      },
    ],
  },
] as Routes;
