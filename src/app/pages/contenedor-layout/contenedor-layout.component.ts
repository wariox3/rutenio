import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from '../../layouts/footer/footer.component';
import { HeaderBasicComponent } from '../../layouts/header-basic/header-basic.component';
import { SidebarComponent } from '../../layouts/sidebar/sidebar.component';
import { SearchModalComponent } from '../../partials/search-modal/search-modal.component';

@Component({
  selector: 'app-contenedor-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    FooterComponent,
    SidebarComponent,
    SearchModalComponent,
    HeaderBasicComponent,
  ],
  templateUrl: './contenedor-layout.component.html',
  styleUrl: './contenedor-layout.component.scss',
})
export default class ContenedorLayoutComponent {}
