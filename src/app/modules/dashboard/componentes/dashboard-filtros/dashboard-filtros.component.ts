import { Component, ChangeDetectionStrategy, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DashboardFiltros } from '../../../../interfaces/dashboard/dashboard.interface';

@Component({
  selector: 'app-dashboard-filtros',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard-filtros.component.html',
  styleUrl: './dashboard-filtros.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardFiltrosComponent {
  @Output() filtrosAplicados = new EventEmitter<DashboardFiltros>();

  fechaDesde = '2026-02-17';
  fechaHasta = '2026-02-23';
  ciudadSeleccionada = '';
  clienteSeleccionado = '';
  tipoVehiculoSeleccionado = '';

  ciudades = ['Bogotá', 'Medellín', 'Cali', 'Barranquilla', 'Cartagena'];
  clientes = ['Cliente Alpha', 'Cliente Beta', 'Cliente Gamma', 'Distribuidora XYZ'];
  tiposVehiculo = ['Camión', 'Furgoneta', 'Moto', 'Bicicleta'];

  aplicarFiltros(): void {
    this.filtrosAplicados.emit({
      fechaDesde: this.fechaDesde,
      fechaHasta: this.fechaHasta,
      ciudad: this.ciudadSeleccionada,
      cliente: this.clienteSeleccionado,
      tipoVehiculo: this.tipoVehiculoSeleccionado,
    });
  }
}
