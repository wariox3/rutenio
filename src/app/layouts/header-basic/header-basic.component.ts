import { Component, HostBinding, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { MenuItems } from '../../interfaces/general/header/menu.interface';
import { General } from '../../common/clases/general';
import { obtenerUsuarioNombreCorto } from '../../redux/selectors/usuario.selector';
import { obtenerContenedorNombre } from '../../redux/selectors/contenedor.selector';
import { MenuComponent } from '../menu/menu.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header-basic',
  standalone: true,
  imports: [CommonModule, MenuComponent],
  templateUrl: './header-basic.component.html',
  styleUrl: './header-basic.component.scss',
})
export class HeaderBasicComponent extends General implements OnInit {
  @HostBinding('class') hostClass =
    'fixed py-4 top-0 z-10 left-0 right-0 flex items-stretch shrink-0 bg-[#fefefe] dark:bg-coal-500 shadow-sm dark:border-b dark:border-b-coal-100';
  @HostBinding('attr.role') hostRole = 'banner';
  @HostBinding('attr.data-sticky') dataSticky = 'true';
  @HostBinding('attr.data-sticky-name') dataStickyName = 'header';
  @HostBinding('id') hostId = 'header';

  public usuarioNombre$: Observable<string>;
  public contenedorNombre$: Observable<string>;

  public menuItems: MenuItems[] = [];

  constructor() {
    super();
    this.usuarioNombre$ = new Observable();
  }

  ngOnInit(): void {
    this.usuarioNombre$ = this.store.select(obtenerUsuarioNombreCorto);
    this.contenedorNombre$ = this.store.select(obtenerContenedorNombre);
  }
}
