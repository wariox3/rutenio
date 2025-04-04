import { Component, HostBinding, OnInit } from '@angular/core';
import { MenuComponent } from '../menu/menu.component';
import { General } from '../../common/clases/general';
import { obtenerUsuarioNombreCorto } from '../../redux/selectors/usuario.selector';
import { Observable, Subject } from 'rxjs';
import { CommonModule } from '@angular/common';
import { obtenerContenedorNombre } from '../../redux/selectors/contenedor.selector';
import { MenuItems } from '../../interfaces/general/header/menu.interface';

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

  public usuarioNombre$: Observable<string>;
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
  ];

  constructor() {
    super();
    this.usuarioNombre$ = new Observable();
  }

  ngOnInit(): void {
    this.usuarioNombre$ = this.store.select(obtenerUsuarioNombreCorto);
    this.contenedorNombre$ = this.store.select(obtenerContenedorNombre);
  }
}
