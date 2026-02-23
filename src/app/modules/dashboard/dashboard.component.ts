import { Component, ChangeDetectionStrategy, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, forkJoin, takeUntil, finalize } from 'rxjs';
import { DashboardService } from './servicios/dashboard.service';
import {
  CumplimientoZona,
  DashboardFiltros,
  DesempenoEntregas,
  KpiIndicador,
  MarcadorMapa,
} from '../../interfaces/dashboard/dashboard.interface';
import { DashboardFiltrosComponent } from './componentes/dashboard-filtros/dashboard-filtros.component';
import { DashboardKpiTarjetaComponent } from './componentes/dashboard-kpi-tarjeta/dashboard-kpi-tarjeta.component';
import { DashboardDesempenoChartComponent } from './componentes/dashboard-desempeno-chart/dashboard-desempeno-chart.component';
import { DashboardCumplimientoZonaComponent } from './componentes/dashboard-cumplimiento-zona/dashboard-cumplimiento-zona.component';
import { DashboardMapaComponent } from './componentes/dashboard-mapa/dashboard-mapa.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    DashboardFiltrosComponent,
    DashboardKpiTarjetaComponent,
    DashboardDesempenoChartComponent,
    DashboardCumplimientoZonaComponent,
    DashboardMapaComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class DashboardComponent implements OnInit, OnDestroy {
  kpis = signal<KpiIndicador[]>([]);
  desempeno = signal<DesempenoEntregas | null>(null);
  cumplimientoZonas = signal<CumplimientoZona[]>([]);
  marcadoresMapa = signal<MarcadorMapa[]>([]);
  cargando = signal(false);

  private destroy$ = new Subject<void>();

  private filtrosPorDefecto: DashboardFiltros = {
    fechaDesde: '',
    fechaHasta: '',
    ciudad: '',
    cliente: '',
    tipoVehiculo: '',
  };

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.cargarDatos(this.filtrosPorDefecto);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  cargarDatos(filtros: DashboardFiltros): void {
    this.cargando.set(true);

    forkJoin({
      kpis: this.dashboardService.obtenerKpis(filtros),
      desempeno: this.dashboardService.obtenerDesempeno(filtros),
      cumplimiento: this.dashboardService.obtenerCumplimientoZona(filtros),
      marcadores: this.dashboardService.obtenerMarcadoresMapa(filtros),
    })
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.cargando.set(false))
      )
      .subscribe({
        next: ({ kpis, desempeno, cumplimiento, marcadores }) => {
          this.kpis.set(kpis);
          this.desempeno.set(desempeno);
          this.cumplimientoZonas.set(cumplimiento);
          this.marcadoresMapa.set(marcadores);
        },
        error: (error) => {
          console.error('Error al cargar datos del dashboard:', error);
        },
      });
  }
}
