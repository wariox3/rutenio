import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KpiIndicador } from '../../../../interfaces/dashboard/dashboard.interface';

@Component({
  selector: 'app-dashboard-kpi-tarjeta',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-kpi-tarjeta.component.html',
  styleUrl: './dashboard-kpi-tarjeta.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardKpiTarjetaComponent {
  @Input({ required: true }) kpi!: KpiIndicador;

  get esPositivo(): boolean {
    return (this.kpi.comparacionAnterior ?? 0) >= 0;
  }

  get colorComparacion(): string {
    if (this.kpi.titulo === 'Novedades') {
      return this.esPositivo ? 'comparacion-negativo' : 'comparacion-positivo';
    }
    return this.esPositivo ? 'comparacion-positivo' : 'comparacion-negativo';
  }

  get iconoComparacion(): string {
    return this.esPositivo ? 'ki-filled ki-arrow-up' : 'ki-filled ki-arrow-down';
  }

  get progresoMeta(): number {
    if (!this.kpi.meta) return 0;
    return Math.min((this.kpi.valor / this.kpi.meta) * 100, 100);
  }

  get colorProgreso(): string {
    if (this.progresoMeta >= 90) return '#0098d7';
    if (this.progresoMeta >= 70) return '#f7c74d';
    return '#f1416c';
  }
}
