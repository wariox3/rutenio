import { Component, HostBinding, OnInit, ElementRef } from '@angular/core';
import { Router, RouterLink, NavigationEnd } from '@angular/router';
import { SidebarMenu } from '../../interfaces/general/sidebar/menu.interface';
import { RouterLinkActive } from '@angular/router';
import { General } from '../../common/clases/general';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent extends General implements OnInit {
  @HostBinding('class') hostClass =
    'sidebar dark:bg-coal-600 bg-light border-r border-r-gray-200 dark:border-r-coal-100 fixed z-20 hidden lg:flex flex-col items-stretch shrink-0';
  @HostBinding('attr.data-drawer') drawer = 'true';
  @HostBinding('attr.data-drawer-class') drawerClass =
    'drawer drawer-start top-0 bottom-0';
  @HostBinding('attr.data-drawer-enable') drawerEnable = 'true|lg:false';
  @HostBinding('attr.id') id = 'sidebar';

  public accordionStates: { [key: string]: boolean } = {};

  constructor(private elementRef: ElementRef) {
    super();
  }

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
        // {
        //   nombre: 'Contactos',
        //   link: '/administracion/contacto/lista',
        // },
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
      nombre: 'Utilidad',
      link: '',
      iconoClase: 'ki-filled ki-setting-3',
      activo: false,
      tipoAcordion: true,
      children: [
        {
          nombre: 'Decodificar dirección',
          link: '/utilidad/decodificar-direccion',
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

  ngOnInit(): void {
    this.initializeAccordionStates();
    this.subscribeToRouteChanges();
  }

  private initializeAccordionStates(): void {
    this.sidebarMenu.forEach(menu => {
      if (menu.tipoAcordion) {
        this.accordionStates[menu.nombre] = this.isParentMenuActive(menu);
      }
    });
  }

  private subscribeToRouteChanges(): void {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.updateAccordionStates();
      });
  }

  private updateAccordionStates(): void {
    this.sidebarMenu.forEach(menu => {
      if (menu.tipoAcordion) {
        this.accordionStates[menu.nombre] = this.isParentMenuActive(menu);
      }
    });
  }

  isActive(link: string): boolean {
    return this.router.url === link;
  }

  isParentMenuActive(menu: SidebarMenu): boolean {
    if (!menu.children) return false;
    return menu.children.some(child => this.router.url.startsWith(child.link));
  }

  toggleAccordion(menuName: string): void {
    this.accordionStates[menuName] = !this.accordionStates[menuName];
  }

  isAccordionOpen(menuName: string): boolean {
    return this.accordionStates[menuName] || false;
  }

  onMenuClick(menu: SidebarMenu): void {
    if (menu.link && menu.link !== '') {
      this.hideDrawerOnMobile();
    }
  }

  onSubMenuClick(subMenu: any): void {
    if (subMenu.link && subMenu.link !== '') {
      this.hideDrawerOnMobile();
    }
  }

  private hideDrawerOnMobile(): void {
    // Solo ocultar en dispositivos móviles donde el drawer está activo
    const drawerElement = this.elementRef.nativeElement;
    if (drawerElement && drawerElement.classList.contains('open')) {
      // Importar dinámicamente la clase KTDrawer
      import('../../../metronic/core/components/drawer/drawer').then(({ KTDrawer }) => {
        const drawer = KTDrawer.getInstance(drawerElement);
        if (drawer && drawer.isOpen()) {
          drawer.hide();
        }
      });
    }
  }
}
