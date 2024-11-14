import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { General } from '../../../../common/clases/general';
import { VehiculoService } from '../../servicios/vehiculo.service';
import VehiculoFormularioComponent from '../vehiculo-formulario/vehiculo-formulario.component';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-vehiculo-nuevo',
  standalone: true,
  imports: [CommonModule, VehiculoFormularioComponent, RouterLink],
  templateUrl: './vehiculo-nuevo.component.html',
  styleUrl: './vehiculo-nuevo.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class VehiculoNuevoComponent extends General {
  private vehiculoService = inject(VehiculoService);

  informacionVehiculo: any = {
    placa: '',
    capacidad: '',
    estado_activo: '',
  };

  enviarFormulario(formulario: any) {
    this.vehiculoService
      .guardarVehiculo(formulario)
      .subscribe((respuesta: any) => {
        this.alerta.mensajaExitoso('Se ha creado el vehículo exitosamente.');
        this.router.navigate([`/admin/vehiculo/lista`]);
      });
  }
}
