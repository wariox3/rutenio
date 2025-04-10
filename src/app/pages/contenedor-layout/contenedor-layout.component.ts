import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from '../../layouts/footer/footer.component';
import { HeaderBasicComponent } from '../../layouts/header-basic/header-basic.component';
import { SidebarComponent } from '../../layouts/sidebar/sidebar.component';
import { SearchModalComponent } from '../../partials/search-modal/search-modal.component';
import { AlertaSuspensionComponent } from "../../common/components/alerta-suspension/alerta-suspension.component";

@Component({
  selector: 'app-contenedor-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    FooterComponent,
    SidebarComponent,
    SearchModalComponent,
    HeaderBasicComponent,
    AlertaSuspensionComponent
],
  templateUrl: './contenedor-layout.component.html',
  styleUrl: './contenedor-layout.component.scss',
})
export default class ContenedorLayoutComponent {}
