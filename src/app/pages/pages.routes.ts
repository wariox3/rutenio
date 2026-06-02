import { Routes } from '@angular/router';
import { authGuard } from '../common/guards/auth.guard';
import { contenedorGuard } from '../common/guards/contenedor.guard';
import { adminGuard } from '../common/guards/admin.guard';

export default [
  {
    path: 'admin/login',
    loadComponent: () =>
      import('../modules/auth/components/admin-login/admin-login.component'),
  },
  {
    path: 'admin/entregas',
    canActivate: [adminGuard],
    loadComponent: () =>
      import('../modules/contenedores/components/contenedor-admin-entregas/contenedor-admin-entregas.component'),
  },
  {
    path: 'admin/entregas/:schema',
    canActivate: [adminGuard],
    loadComponent: () =>
      import('../modules/contenedores/components/contenedor-admin-entregas-detalle/contenedor-admin-entregas-detalle.component'),
  },
  {
    path: 'admin/whatsapp',
    canActivate: [adminGuard],
    loadComponent: () =>
      import('../modules/contenedores/components/contenedor-admin-whatsapp/contenedor-admin-whatsapp.component'),
  },
  {
    path: 'admin/contenedores',
    canActivate: [adminGuard],
    loadComponent: () =>
      import('../modules/contenedores/components/contenedor-admin-contenedores/contenedor-admin-contenedores.component'),
  },
  {
    path: 'admin/usuarios',
    canActivate: [adminGuard],
    loadComponent: () =>
      import('../modules/contenedores/components/contenedor-admin-usuarios/contenedor-admin-usuarios.component'),
  },
  {
    path: 'admin/usuarios/crear',
    canActivate: [adminGuard],
    loadComponent: () =>
      import('../modules/contenedores/components/contenedor-admin-usuario-crear/contenedor-admin-usuario-crear.component'),
  },
  {
    path: 'admin/usuarios/:id',
    canActivate: [adminGuard],
    loadComponent: () =>
      import('../modules/contenedores/components/contenedor-admin-usuario-detalle/contenedor-admin-usuario-detalle.component'),
  },
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
    // Facturacion vive bajo el panel administrativo: requiere admin_token
    // (is_staff/is_superuser de la plataforma), no solo authGuard.
    path: 'facturacion',
    canActivate: [adminGuard],
    loadComponent: () =>
      import('./facturacion-layout/facturacion-layout.component'),
    children: [
      {
        path: '',
        loadChildren: () => import('../modules/facturacion/facturacion.routes'),
      },
    ],
  },
  {
    path: 'perfil',
    canActivate: [authGuard],
    loadComponent: () => import('./facturacion-layout/facturacion-layout.component'),
    children: [
      {
        path: '',
        loadComponent: () => import('../modules/perfil/componentes/perfil.component')
      }
    ]
  },
  {
    path: 'configuracion',
    canActivate: [authGuard],
    loadComponent: () => import('./facturacion-layout/facturacion-layout.component'),
    children: [
      {
        path: '',
        loadComponent: () => import('../modules/configuracion/components/configuracion/configuracion.component')
      },
      {
        path: 'whatsapp',
        loadComponent: () => import('../modules/mensajeria/components/whatsapp-conexion/whatsapp-conexion.component')
      }
    ]
  },
  {
    path: 'estado',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./facturacion-layout/facturacion-layout.component'),
    children: [
      {
        path: '',
        loadComponent: () =>  import(
              '../modules/facturacion/components/facturacion-mensaje-pago/facturacion-mensaje-pago.component'
            ).then((c) => c.FacturacionMensajePagoComponent),
      },
    ]
  },
  {
    path: 'dashboard',
    canActivate: [authGuard, contenedorGuard],
    loadComponent: () =>
      import('./admin-layout/admin-layout.component'),
    children: [
      {
        path: '',
        loadChildren: () => import('../modules/dashboard/dashboard.routes'),
      },
    ]
  },
  {
    path: 'rutear',
    canActivate: [authGuard, contenedorGuard],
    loadComponent: () =>
      import('./admin-layout/admin-layout.component'),
    children: [
      {
        path: '',
        loadComponent: () =>
          import(
            '../modules/visita/componentes/visita-rutear/visita-rutear.component'
          ),
      },
    ]
  },
  {
    path: 'diseno-ruta',
    canActivate: [authGuard, contenedorGuard],
    loadComponent: () =>
      import('./admin-layout/admin-layout.component'),
    children: [
      {
        path: '',
        loadChildren: () => import('../modules/diseno-ruta/diseno-ruta.routes'),
      },
    ]
  },
  {
    path: 'trafico',
    canActivate: [authGuard, contenedorGuard],
    loadComponent: () =>
      import('./admin-layout/admin-layout.component'),
    children: [
      {
        path: '',
        loadChildren: () => import('../modules/trafico/trafico.routes'),
      },
    ]
  },
  {
    path: 'complemento',
    canActivate: [authGuard, contenedorGuard],
    loadComponent: () =>
      import('./admin-layout/admin-layout.component'),
    children: [
      {
        path: '',
        loadChildren: () =>
          import('../modules/complementos/complemento.routes'),
      },
    ]
  },
  {
    path: 'mensajeria',
    canActivate: [authGuard, contenedorGuard],
    loadComponent: () =>
      import('./admin-layout/admin-layout.component'),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('../modules/mensajeria/components/inbox/inbox.component'),
      },
    ]
  },
  {
    path: 'administracion',
    canActivate: [authGuard, contenedorGuard],
    loadComponent: () => import('./admin-layout/admin-layout.component'),
    children: [
      {
        path: 'contacto',
        loadChildren: () => import('../modules/contacto/contacto.routes'),
      },
      {
        path: 'franja',
        loadChildren: () => import('../modules/franja/franja.routes'),
      },
      {
        path: 'vehiculo',
        loadChildren: () => import('../modules/vehiculo/vehiculo.routes'),
      },
    ],
  },
  {
    // Gestion de miembros del contenedor activo: invitar, perfiles,
    // permisos, ceder admin. El gating por 'usuario.editar' lo hace el
    // sidebar (item oculto) y el backend (puede_editar_modulo).
    path: 'usuarios',
    canActivate: [authGuard, contenedorGuard],
    loadComponent: () => import('./admin-layout/admin-layout.component'),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('../modules/contenedores/components/usuarios-contenedor/usuarios-contenedor.component'),
      },
    ],
  },
  {
    path: 'proceso',
    canActivate: [authGuard, contenedorGuard],
    loadComponent: () => import('./admin-layout/admin-layout.component'),
    children: [
      {
        path: '',
        loadChildren: () => import('../modules/proceso/proceso.routes'),
      },
    ],
  },
  {
    path: 'utilidad',
    canActivate: [authGuard, contenedorGuard],
    loadComponent: () => import('./admin-layout/admin-layout.component'),
    children: [
      {
        path: '',
        loadChildren: () => import('../modules/utilidad/utilidad.routes'),
      },
    ],
  },
  {
    path: 'movimiento',
    canActivate: [authGuard, contenedorGuard],
    loadComponent: () => import('./admin-layout/admin-layout.component'),
    children: [
      {
        path: 'novedad',
        loadChildren: () => import('../modules/novedad/novedad.routes'),
      },
      {
        path: 'visita',
        loadChildren: () => import('../modules/visita/visita.routes'),
      },
      {
        path: 'despacho',
        loadChildren: () => import('../modules/despacho/despacho.routes'),
      },
      {
        path: 'reporte-mensajero',
        loadChildren: () =>
          import('../modules/reporte-mensajero/reporte-mensajero.routes'),
      },
    ]
  },
  {
    path: 'politicas_privacidad',
    loadComponent: () => import('../modules/politicas-privacidad/componentes/politicas-privacidad/politicas-privacidad')

  },
  {
    path: 'terminos_de_uso',
    loadComponent: () => import('../modules/termininos-uso/componentes/terminos-uso/terminos-uso.component')
  },
] as Routes;
