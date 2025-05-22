import { CommonModule } from '@angular/common';
import { Component, HostBinding, OnInit, signal } from '@angular/core';
import { map, Observable } from 'rxjs';
import { General } from '../../common/clases/general';
import { MenuItems } from '../../interfaces/general/header/menu.interface';
import { obtenerContenedorNombre } from '../../redux/selectors/contenedor.selector';
import { obtenerUsuario } from '../../redux/selectors/usuario.selector';
import { MenuComponent } from '../menu/menu.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, MenuComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
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
  public image$ = this.usuario$.pipe(map(usuario => usuario.imagen))

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
    {
      titulo: 'Configuración',
      icono: 'ki-filled ki-setting-2',
      link: '/configuracion',
    },
  ];

  constructor() {
    super();
  }

  ngOnInit(): void {
    this.image$.subscribe(image => console.log(image))
    this.contenedorNombre$ = this.store.select(obtenerContenedorNombre);
  }
}
