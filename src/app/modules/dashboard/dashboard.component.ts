import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { General } from '../../common/clases/general';
import { ListaVehiculo } from '../../interfaces/vehiculo/vehiculo.interface';
import { Visita } from '../../interfaces/visita/visita.interface';
import { FooterComponent } from '../../layouts/footer/footer.component';
import { HeaderComponent } from '../../layouts/header/header.component';
import { SidebarComponent } from '../../layouts/sidebar/sidebar.component';
import { SearchModalComponent } from '../../partials/search-modal/search-modal.component';
import { VehiculoService } from '../vehiculo/servicios/vehiculo.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    HeaderComponent,
    FooterComponent,
    SidebarComponent,
    SearchModalComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export default class DashboardComponent extends General {
  arrParametrosConsulta: any = {
    filtros: [],
    limite: 50,
    desplazar: 0,
    ordenamientos: [],
    limite_conteo: 10000,
    modelo: 'RutVehiculo',
  };

  arrParametrosConsultaVisita: any = {
    filtros: [{ propiedad: 'estado_decodificado', valor1: true }],
    limite: 50,
    desplazar: 0,
    ordenamientos: [],
    limite_conteo: 10000,
    modelo: 'RutVisita',
  };

  arrVehiculos: ListaVehiculo[] = [];
  arrVisitas: Visita[];

  constructor(
    private vehiculoService: VehiculoService,
  ) {
    super();
  }
}
