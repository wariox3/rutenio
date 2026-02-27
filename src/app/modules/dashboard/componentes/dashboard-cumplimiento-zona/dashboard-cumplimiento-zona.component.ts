import { Component, ChangeDetectionStrategy, Input, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CumplimientoZona } from '../../../../interfaces/dashboard/dashboard.interface';
import { ModalStandardComponent } from '../../../../common/components/ui/modals/modal-standard/modal-standard.component';
import { ModalService } from '../../../../common/components/ui/modals/service/modal.service';

@Component({
  selector: 'app-dashboard-cumplimiento-zona',
  standalone: true,
  imports: [CommonModule, ModalStandardComponent],
  templateUrl: './dashboard-cumplimiento-zona.component.html',
  styleUrl: './dashboard-cumplimiento-zona.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardCumplimientoZonaComponent {
  private modalService = inject(ModalService);

  @Input({ required: true }) zonas!: CumplimientoZona[];
  zonaSeleccionada = signal<CumplimientoZona | null>(null);

  mostrarAyuda(zona: CumplimientoZona): void {
    this.zonaSeleccionada.set(zona);
    this.modalService.open('modalAyudaCumplimiento');
  }

  obtenerIconoEstado(estado: string): string {
    switch (estado) {
      case 'ok': return 'ki-filled ki-check-circle';
      case 'alerta': return 'ki-filled ki-information-3';
      case 'critico': return 'ki-filled ki-cross-circle';
      default: return 'ki-filled ki-information-3';
    }
  }

  obtenerTextoEstado(estado: string): string {
    switch (estado) {
      case 'ok': return 'Cumple';
      case 'alerta': return 'Alerta';
      case 'critico': return 'Crítico';
      default: return 'Sin datos';
    }
  }

  obtenerFondoEstado(estado: string): string {
    switch (estado) {
      case 'ok': return '#0098d71a';
      case 'alerta': return '#f7c74d1a';
      case 'critico': return '#f1416c1a';
      default: return '#5757571a';
    }
  }
}
