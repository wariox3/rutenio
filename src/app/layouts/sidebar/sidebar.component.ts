import { Component, HostBinding } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SidebarMenu } from '../../interfaces/general/sidebar/menu.interface';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  @HostBinding('class') hostClass =
    'sidebar dark:bg-coal-600 bg-light border-r border-r-gray-200 dark:border-r-coal-100 fixed z-20 hidden lg:flex flex-col items-stretch shrink-0';
  @HostBinding('attr.data-drawer') drawer = 'true';
  @HostBinding('attr.data-drawer-class') drawerClass =
    'drawer drawer-start top-0 bottom-0';
  @HostBinding('attr.data-drawer-enable') drawerEnable = 'true|lg:false';
  @HostBinding('attr.id') id = 'sidebar';

  public sidebarMenu: SidebarMenu[] = [
    {
      nombre: 'Inicio',
      link: '/admin/dashboard',
      iconoClase: 'ki-filled ki-home',
      activo: false,
    },
    {
      nombre: 'Rutear',
      link: '/admin/rutear',
      iconoClase: 'ki-filled ki-map',
      activo: false,
    },
    {
      nombre: 'Tráfico',
      link: '/admin/trafico',
      iconoClase: 'ki-filled ki-delivery',
      activo: false,
    },
    {
      nombre: 'Movimiento',
      link: '',
      iconoClase: 'ki-filled ki-book',
      activo: false,
      tipoAcordion: true,
      children: [
        {
          nombre: 'Visita',
          link: '/admin/visita/lista',
        },
        {
          nombre: 'Despacho',
          link: '/admin/despacho/lista',
        },
      ],
    },
    {
      nombre: 'Administración',
      link: '',
      iconoClase: 'ki-filled ki-setting-2',
      activo: false,
      tipoAcordion: true,
      children: [
        {
          nombre: 'Vehículos',
          link: '/admin/vehiculo/lista',
        },
        {
          nombre: 'Contactos',
          link: '/admin/contacto/lista',
        },
        {
          nombre: 'Franjas',
          link: '/admin/franja/lista',
        },
      ],
    },
    {
      nombre: 'Utilidad',
      link: '',
      iconoClase: 'ki-filled ki-folder',
      activo: false,
      tipoAcordion: true,
      children: [
        {
          nombre: 'Importar visitas',
          link: '/admin/visita/lista',
        },
      ],
    },
    {
      nombre: 'Complementos',
      link: '/admin/complementos',
      iconoClase: 'ki-filled ki-plus-squared',
      activo: false,
    },
  ];
}
