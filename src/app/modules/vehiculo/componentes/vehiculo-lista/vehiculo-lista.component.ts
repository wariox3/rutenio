import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
} from '@angular/core';
import { mapeo } from '../../../../common/mapeos/administradores';
import { VehiculoService } from '../../servicios/vehiculo.service';
import { ParametrosConsulta } from '../../../../interfaces/general/api.interface';
import {
  ListaVehiculo,
  Vehiculo,
} from '../../../../interfaces/vehiculo/vehiculo.interface';
import { General } from '../../../../common/clases/general';
import { ButtonComponent } from '../../../../common/components/ui/button/button.component';
import { RouterLink } from '@angular/router';
import { TablaComunComponent } from '../../../../common/components/ui/tablas/tabla-comun/tabla-comun.component';

@Component({
  selector: 'app-vehiculo-lista',
  standalone: true,
  imports: [CommonModule, ButtonComponent, RouterLink, TablaComunComponent],
  templateUrl: './vehiculo-lista.component.html',
  styleUrl: './vehiculo-lista.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class VehiculoListaComponent extends General implements OnInit {
  arrParametrosConsulta: ParametrosConsulta = {
    filtros: [],
    limite: 50,
    desplazar: 0,
    ordenamientos: [],
    limite_conteo: 10000,
    modelo: 'RutVehiculo',
  };
  cantidad_registros!: number;
  arrVehiculos: ListaVehiculo[];
  encabezados: any[];

  private vehiculoService = inject(VehiculoService);

  ngOnInit(): void {
    this.consultarLista();
    this.encabezados = mapeo.Vehiculo.datos
      .filter((dato) => dato.visibleTabla === true)
      .map((dato) => dato.nombre);
  }

  consultarLista() {
    this.vehiculoService
      .lista(this.arrParametrosConsulta)
      .subscribe((respuesta) => {
        this.cantidad_registros = respuesta.cantidad_registros;
        this.arrVehiculos = respuesta.registros;
        this.changeDetectorRef.detectChanges();
      });
  }
}
