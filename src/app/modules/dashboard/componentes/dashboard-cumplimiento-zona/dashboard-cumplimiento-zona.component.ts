import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CumplimientoZona } from '../../../../interfaces/dashboard/dashboard.interface';

@Component({
  selector: 'app-dashboard-cumplimiento-zona',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-cumplimiento-zona.component.html',
  styleUrl: './dashboard-cumplimiento-zona.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardCumplimientoZonaComponent {
  @Input({ required: true }) zonas!: CumplimientoZona[];

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
