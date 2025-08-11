import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  OnInit,
  signal,
} from '@angular/core';
import { filter, map, Observable } from 'rxjs';
import { General } from '../../common/clases/general';
import { MenuItems } from '../../interfaces/general/header/menu.interface';
import { obtenerContenedorNombre } from '../../redux/selectors/contenedor.selector';
import { obtenerUsuario } from '../../redux/selectors/usuario.selector';
import { MenuComponent } from '../menu/menu.component';
import { NavigationEnd, Router } from '@angular/router';
import { ContenedorActionBorrarInformacion } from '../../redux/actions/contenedor/contenedor.actions';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, MenuComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent extends General implements OnInit {
  @HostBinding('class') hostClass =
    'header fixed top-0 z-10 left-0 right-0 flex items-stretch shrink-0 bg-[#fefefe] dark:bg-coal-500 shadow-sm dark:border-b dark:border-b-coal-100';
  @HostBinding('attr.role') hostRole = 'banner';
  @HostBinding('attr.data-sticky') dataSticky = 'true';
  @HostBinding('attr.data-sticky-name') dataStickyName = 'header';
  @HostBinding('id') hostId = 'header';

  public usuario$ = this.store.select(obtenerUsuario);
  public contenedorNombre$: Observable<string>;

  public menuItems: MenuItems[] = [
    {
      titulo: 'Mis contenedores',
      icono: 'ki-filled ki-abstract-26',
      link: '/contenedor/lista',
    },
    {
      titulo: 'Facturación',
      icono: 'ki-cheque ki-abstract-26',
      link: '/facturacion/lista',
    },
    {
      titulo: 'Configuración',
      icono: 'ki-filled ki-setting-2',
      link: '/configuracion',
    },
  ];

  constructor() {
    super();
  }

  getUserImageUrl() {
    return this.usuario$?.pipe(
      map((usuario) => {
        if (usuario?.imagen_thumbnail.includes('defecto')) {
          return usuario?.imagen_thumbnail;
        } else {
          return `${usuario?.imagen_thumbnail}?${new Date().getTime()}`;
        }
      })
    );
  }

  ngOnInit(): void {
    this.contenedorNombre$ = this.store.select(obtenerContenedorNombre);

    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        if (event.url === '/contenedor/lista') {
          this.limpiarEstado();
        }
      });
  }

  private limpiarEstado() {
    this.store.dispatch(ContenedorActionBorrarInformacion());
  }
}
