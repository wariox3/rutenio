import { Component, HostBinding, OnInit, ElementRef } from '@angular/core';
import { Router, RouterLink, NavigationEnd } from '@angular/router';
import { SidebarMenu, SidebarMenuItem } from '../../interfaces/general/sidebar/menu.interface';
import { Store } from '@ngrx/store';
import {
  obtenerEsAdminContenedor,
  obtenerPermisos,
} from '../../redux/selectors/contenedor.selector';
import { obtenerEsSuperAdmin } from '../../redux/selectors/auth.selector';
import { takeUntil } from 'rxjs';
import { Subject } from 'rxjs';
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
      modulo: 'visita',
    },
    {
      nombre: 'Diseño ruta',
      link: '/diseno-ruta/lista',
      iconoClase: 'ki-filled ki-design-1',
      activo: false,
      modulo: 'visita',
    },
    {
      nombre: 'Tráfico',
      link: '/trafico/lista',
      iconoClase: 'ki-filled ki-delivery',
      activo: false,
      modulo: 'despacho',
    },
    {
      nombre: 'Mensajería',
      link: '/mensajeria',
      iconoClase: 'ki-filled ki-messages',
      activo: false,
      modulo: 'mensajeria',
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
          modulo: 'visita',
        },
        {
          nombre: 'Despacho',
          link: '/movimiento/despacho/lista',
          modulo: 'despacho',
        },
        {
          nombre: 'Novedad',
          link: '/movimiento/novedad/lista',
          modulo: 'novedad',
        },
        {
          nombre: 'Reporte mensajero',
          link: '/movimiento/reporte-mensajero',
          modulo: 'reporte',
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
          modulo: 'vehiculo',
        },
        // {
        //   nombre: 'Contactos',
        //   link: '/administracion/contacto/lista',
        //   modulo: 'contacto',
        // },
        {
          nombre: 'Franjas',
          link: '/administracion/franja/lista',
          modulo: 'franja',
        },
        {
          nombre: 'Usuarios',
          link: '/usuarios',
          modulo: 'usuario',
        },
      ],
    },
    {
      nombre: 'Proceso',
      link: '',
      iconoClase: 'ki-filled ki-abstract-22',
      activo: false,
      tipoAcordion: true,
      soloAdmin: true,
      children: [
        {
          nombre: 'Enviar entrega complemento',
          link: '/proceso/enviar-entrega-complemento',
          soloAdmin: true,
        },
        {
          nombre: 'Enviar novedad complemento',
          link: '/proceso/enviar-novedad-complemento',
          soloAdmin: true,
        },
      ],
    },
    {
      nombre: 'Utilidad',
      link: '',
      iconoClase: 'ki-filled ki-setting-3',
      activo: false,
      tipoAcordion: true,
      soloAdmin: true,
      children: [
        {
          nombre: 'Decodificar dirección',
          link: '/utilidad/decodificar-direccion',
          soloAdmin: true,
        },
      ],
    },
    {
      nombre: 'Complementos',
      link: '/complemento/lista',
      iconoClase: 'ki-filled ki-plus-squared',
      activo: false,
      soloAdmin: true,
    },
  ];

  public esAdmin = false;
  public esSuperAdmin = false;
  public permisos: Record<string, { ver: boolean; editar: boolean }> | null = null;
  private _destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.store
      .select(obtenerEsAdminContenedor)
      .pipe(takeUntil(this._destroy$))
      .subscribe((esAdmin) => {
        this.esAdmin = !!esAdmin;
      });
    this.store
      .select(obtenerEsSuperAdmin)
      .pipe(takeUntil(this._destroy$))
      .subscribe((es) => {
        this.esSuperAdmin = !!es;
      });
    this.store
      .select(obtenerPermisos)
      .pipe(takeUntil(this._destroy$))
      .subscribe((p) => {
        this.permisos = p;
      });
    this.initializeAccordionStates();
    this.subscribeToRouteChanges();
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  private tienePermisoVer(modulo?: string): boolean {
    if (!modulo) return true;
    if (this.esAdmin || this.esSuperAdmin) return true;
    return !!this.permisos?.[modulo]?.ver;
  }

  puedeVerMenu(menu: SidebarMenu): boolean {
    if (menu.soloSuperAdmin) return this.esSuperAdmin;
    if (menu.soloAdmin && !this.esAdmin && !this.esSuperAdmin) return false;
    if (menu.children?.length) {
      // Acordeón: visible si al menos uno de sus hijos lo es.
      return menu.children.some((c) => this.puedeVerSubmenu(c));
    }
    return this.tienePermisoVer(menu.modulo);
  }

  puedeVerSubmenu(sub: SidebarMenuItem): boolean {
    if (sub.soloSuperAdmin) return this.esSuperAdmin;
    if (sub.soloAdmin && !this.esAdmin && !this.esSuperAdmin) return false;
    return this.tienePermisoVer(sub.modulo);
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
