import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UtilizacionFlota } from '../../../../interfaces/dashboard/dashboard.interface';

@Component({
  selector: 'app-dashboard-utilizacion-flota',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-utilizacion-flota.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardUtilizacionFlotaComponent {
  @Input({ required: true }) datos!: UtilizacionFlota;
}
