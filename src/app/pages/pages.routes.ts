import { Routes } from '@angular/router';
import { authGuard } from '../common/guards/auth.guard';
import { contenedorGuard } from '../common/guards/contenedor.guard';

export default [
  {
    path: 'contenedor',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./contenedor-layout/contenedor-layout.component'),
    children: [
      {
        path: '',
        loadChildren: () => import('../modules/contenedores/contenedor.routes'),
      },
    ],
  },
  {
    path: 'admin',
    canActivate: [authGuard, contenedorGuard],
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
      {
        path: 'rutear',
        loadComponent: () =>
          import(
            '../modules/visita/componentes/visita-rutear/visita-rutear.component'
          ),
      },
      {
        path: 'complemento',
        loadChildren: () =>
          import('../modules/complementos/complemento.routes'),
      },
    ],
  },
] as Routes;
