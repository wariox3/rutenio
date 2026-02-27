import { Component, ChangeDetectionStrategy, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil, catchError, of } from 'rxjs';
import { DashboardService } from './servicios/dashboard.service';
import {
  CumplimientoZona,
  DashboardFiltros,
  KpiIndicador,
  MarcadorMapa,
} from '../../interfaces/dashboard/dashboard.interface';
import { DashboardKpiTarjetaComponent } from './componentes/dashboard-kpi-tarjeta/dashboard-kpi-tarjeta.component';
import { DashboardCumplimientoZonaComponent } from './componentes/dashboard-cumplimiento-zona/dashboard-cumplimiento-zona.component';
import { DashboardMapaComponent } from './componentes/dashboard-mapa/dashboard-mapa.component';
import { ModalStandardComponent } from '../../common/components/ui/modals/modal-standard/modal-standard.component';
import { ModalService } from '../../common/components/ui/modals/service/modal.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    DashboardKpiTarjetaComponent,
    DashboardCumplimientoZonaComponent,
    DashboardMapaComponent,
    ModalStandardComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class DashboardComponent implements OnInit, OnDestroy {
  private modalService = inject(ModalService);

  kpis = signal<KpiIndicador[]>([]);
  cumplimientoZonas = signal<CumplimientoZona[]>([]);
  marcadoresMapa = signal<MarcadorMapa[]>([]);
  cargando = signal(false);
  mostrarMapa = signal(false);
  cargandoMapa = signal(false);
  kpiSeleccionado = signal<KpiIndicador | null>(null);

  private destroy$ = new Subject<void>();
  private llamadasPendientes = 0;

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
    this.llamadasPendientes = 2;

    this.dashboardService.obtenerKpis(filtros)
      .pipe(takeUntil(this.destroy$), catchError(() => of([])))
      .subscribe((datos) => {
        this.kpis.set(datos);
        this.verificarCarga();
      });

    this.dashboardService.obtenerCumplimientoZona(filtros)
      .pipe(takeUntil(this.destroy$), catchError(() => of([])))
      .subscribe((datos) => {
        this.cumplimientoZonas.set(datos);
        this.verificarCarga();
      });
  }

  mostrarAyuda(kpi: KpiIndicador): void {
    this.kpiSeleccionado.set(kpi);
    this.modalService.open('modalAyudaKpi');
  }

  cargarMapa(): void {
    this.mostrarMapa.set(true);
    this.cargandoMapa.set(true);

    this.dashboardService.obtenerMarcadoresMapa(this.filtrosPorDefecto)
      .pipe(takeUntil(this.destroy$), catchError(() => of([])))
      .subscribe((datos) => {
        this.marcadoresMapa.set(datos);
        this.cargandoMapa.set(false);
      });
  }

  private verificarCarga(): void {
    this.llamadasPendientes--;
    if (this.llamadasPendientes <= 0) {
      this.cargando.set(false);
    }
  }
}
