import { Component, HostBinding, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { map, Observable } from 'rxjs';
import { MenuItems } from '../../interfaces/general/header/menu.interface';
import { General } from '../../common/clases/general';
import { obtenerUsuario, obtenerUsuarioNombreCorto } from '../../redux/selectors/usuario.selector';
import { obtenerContenedorNombre } from '../../redux/selectors/contenedor.selector';
import { MenuComponent } from '../menu/menu.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header-basic',
  standalone: true,
  imports: [CommonModule, MenuComponent],
  templateUrl: './header-basic.component.html',
  styleUrl: './header-basic.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderBasicComponent extends General implements OnInit {
  @HostBinding('class') hostClass =
    'fixed py-4 top-0 z-10 left-0 right-0 flex items-stretch shrink-0 bg-[#fefefe] dark:bg-coal-500 shadow-sm dark:border-b dark:border-b-coal-100';
  @HostBinding('attr.role') hostRole = 'banner';
  @HostBinding('attr.data-sticky') dataSticky = 'true';
  @HostBinding('attr.data-sticky-name') dataStickyName = 'header';
  @HostBinding('id') hostId = 'header';

  public usuario$ = this.store.select(obtenerUsuario);
  public contenedorNombre$: Observable<string>;

  public menuItems: MenuItems[] = [
    {
      titulo: 'Perfil',
      icono: 'ki-filled ki-user',
      link: '/perfil',
    },
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
  ];

  constructor() {
    super();
  }

  private imageTimestamp = Date.now();

  getUserImageUrl() {
    return this.usuario$?.pipe(map((usuario) => {
      if(usuario?.imagen.includes('defecto')){
        return usuario?.imagen;
      } else {
        return `${usuario?.imagen}?${new Date().getTime()}`;
      }
    }));
  }


  ngOnInit(): void {
    this.contenedorNombre$ = this.store.select(obtenerContenedorNombre);
  }
}
