import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { General } from '../../../../common/clases/general';
import { ButtonComponent } from '../../../../common/components/ui/button/button.component';
import { TablaComunComponent } from '../../../../common/components/ui/tablas/tabla-comun/tabla-comun.component';
import { mapeo } from '../../../../common/mapeos/administradores';
import { ParametrosConsulta } from '../../../../interfaces/general/api.interface';
import { ListaVehiculo } from '../../../../interfaces/vehiculo/vehiculo.interface';
import { VehiculoService } from '../../servicios/vehiculo.service';
import { finalize } from 'rxjs';

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
  public mapeoAdministrador = mapeo;
  private _listaItemsEliminar: number[] = [];
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

  editarVehiculo(id: number) {
    this.router.navigateByUrl(`/administracion/vehiculo/editar/${id}`);
  }

  detalleVehiculo(id: number) {
    this.router.navigateByUrl(`/administracion/vehiculo/detalle/${id}`);
  }

  actualizarItemsSeleccionados(items: any[]) {
    this._listaItemsEliminar = items;
  }

  eliminarItemsSeleccionados() {
    if (this._listaItemsEliminar.length === 0) {
      return;
    }

    this.vehiculoService
      .eliminarVehiculos(this._listaItemsEliminar)
      .pipe(
        finalize(() => {
          this._listaItemsEliminar = [];
          this.consultarLista();
          this.changeDetectorRef.detectChanges();
        })
      )
      .subscribe({
        next: () => {
          this.alerta.mensajaExitoso('Se han eliminado los registros');
        },
        error: (error) => {
          this.alerta.mensajeError(
            'Error al eliminar',
            'No se han eliminado algunos de los registros'
          );
        },
      });
  }
}
