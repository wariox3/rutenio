import { Component, HostBinding } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SidebarMenu } from '../../interfaces/general/sidebar/menu.interface';
import { RouterLinkActive } from '@angular/router';
import { General } from '../../common/clases/general';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent extends General {
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
      link: '/dashboard',
      iconoClase: 'ki-filled ki-home',
      activo: false,
    },
    {
      nombre: 'Rutear',
      link: '/rutear',
      iconoClase: 'ki-filled ki-map',
      activo: false,
    },
    {
      nombre: 'Diseño ruta',
      link: '/diseno-ruta/lista',
      iconoClase: 'ki-filled ki-design-1',
      activo: false,
    },
    {
      nombre: 'Tráfico',
      link: '/trafico/lista',
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
          link: '/movimiento/visita/lista',
        },
        {
          nombre: 'Despacho',
          link: '/movimiento/despacho/lista',
        },
        {
          nombre: 'Novedad',
          link: '/movimiento/novedad/lista',
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
          link: '/administracion/vehiculo/lista',
        },
        {
          nombre: 'Contactos',
          link: '/administracion/contacto/lista',
        },
        {
          nombre: 'Franjas',
          link: '/administracion/franja/lista',
        },
      ],
    },
    {
      nombre: 'Proceso',
      link: '',
      iconoClase: 'ki-filled ki-abstract-22',
      activo: false,
      tipoAcordion: true,
      children: [
        {
          nombre: 'Enviar entrega complemento',
          link: '/proceso/enviar-entrega-complemento',
        },
        {
          nombre: 'Enviar novedad complemento',
          link: '/proceso/enviar-novedad-complemento',
        },
      ],
    },
    {
      nombre: 'Complementos',
      link: '/complemento/lista',
      iconoClase: 'ki-filled ki-plus-squared',
      activo: false,
    },
  ];

  isActive(link: string): boolean {
    return this.router.url === link;
  }
}
