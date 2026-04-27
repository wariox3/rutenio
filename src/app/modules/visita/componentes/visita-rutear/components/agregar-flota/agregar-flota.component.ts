import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KTModal } from '../../../../../../../metronic/core';
import { General } from '../../../../../../common/clases/general';
import { SoloNumerosDirective } from '../../../../../../common/directivas/solo-numeros.directive';
import { ListaFlota } from '../../../../../../interfaces/flota/flota.interface';

@Component({
  selector: 'app-agregar-flota',
  standalone: true,
  imports: [CommonModule, FormsModule, SoloNumerosDirective],
  templateUrl: './agregar-flota.component.html',
  styleUrl: './agregar-flota.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AgregarFlotaComponent extends General {
  @Input() flotaActual: ListaFlota[] = [];
  @Output() emitirActualizarPrioridad = new EventEmitter<{
    flota: ListaFlota;
    prioridad: number;
  }>();

  public busqueda = '';

  get capacidadDisponible(): number {
    return this.flotaActual
      .filter((f) => !f.vehiculo_estado_asignado)
      .reduce((sum, f) => sum + (f.vehiculo_capacidad || 0), 0);
  }

  get tiempoDisponible(): number {
    return this.flotaActual
      .filter((f) => !f.vehiculo_estado_asignado)
      .reduce((sum, f) => sum + (f.vehiculo_tiempo || 0), 0);
  }

  get flotaFiltrada(): ListaFlota[] {
    const termino = this.busqueda.trim().toLowerCase();
    if (!termino) {
      return this.flotaActual;
    }
    return this.flotaActual.filter((f) => {
      const placa = (f.vehiculo_placa || '').toLowerCase();
      const franjas = (f.vehiculo_franjas || [])
        .map((fr) => fr.nombre?.toLowerCase() || '')
        .join(' ');
      return placa.includes(termino) || franjas.includes(termino);
    });
  }

  limpiarBusqueda() {
    this.busqueda = '';
  }

  actualizarPrioridad(event: Event, flota: ListaFlota) {
    const valor = (event.target as HTMLInputElement).value;
    if (!valor || flota.prioridad === Number(valor)) {
      return;
    }
    this.emitirActualizarPrioridad.emit({ flota, prioridad: Number(valor) });
  }

  cerrar() {
    this._dismissModal();
  }

  private _dismissModal() {
    const modalEl: HTMLElement = document.querySelector('#agregar-flota');
    const modal = KTModal.getInstance(modalEl);
    modal.toggle();
  }
}
