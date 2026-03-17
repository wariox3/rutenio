import { Component, ChangeDetectionStrategy, OnInit, OnDestroy, signal, inject, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil, catchError, of } from 'rxjs';
import { DashboardService } from './servicios/dashboard.service';
import {
  DashboardFiltros,
  DatoDiario,
  KpiIndicador,
  MarcadorMapa,
  UtilizacionFlota,
} from '../../interfaces/dashboard/dashboard.interface';
import { DashboardKpiTarjetaComponent } from './componentes/dashboard-kpi-tarjeta/dashboard-kpi-tarjeta.component';
import { DashboardCumplimientoZonaComponent } from './componentes/dashboard-cumplimiento-zona/dashboard-cumplimiento-zona.component';
import { DashboardMapaComponent } from './componentes/dashboard-mapa/dashboard-mapa.component';
import { DashboardUtilizacionFlotaComponent } from './componentes/dashboard-utilizacion-flota/dashboard-utilizacion-flota.component';
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
    DashboardUtilizacionFlotaComponent,
    ModalStandardComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class DashboardComponent implements OnInit, OnDestroy {
  private modalService = inject(ModalService);
  private renderer = inject(Renderer2);

  kpis = signal<KpiIndicador[]>([]);
  datosGrafico = signal<DatoDiario[]>([]);
  utilizacionFlota = signal<UtilizacionFlota | null>(null);
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
    this.renderer.addClass(document.body, 'dashboard-activo');
    this.cargarDatos(this.filtrosPorDefecto);
  }

  ngOnDestroy(): void {
    this.renderer.removeClass(document.body, 'dashboard-activo');
    this.destroy$.next();
    this.destroy$.complete();
  }

  cargarDatos(filtros: DashboardFiltros): void {
    this.cargando.set(true);
    this.llamadasPendientes = 3;

    this.dashboardService.obtenerKpis(filtros)
      .pipe(takeUntil(this.destroy$), catchError(() => of([])))
      .subscribe((datos) => {
        this.kpis.set(datos);
        this.verificarCarga();
      });

    this.dashboardService.obtenerDatosGrafico(filtros)
      .pipe(takeUntil(this.destroy$), catchError(() => of([])))
      .subscribe((datos) => {
        this.datosGrafico.set(datos);
        this.verificarCarga();
      });

    this.dashboardService.obtenerUtilizacionFlota(filtros)
      .pipe(
        takeUntil(this.destroy$),
        catchError(() => of(null))
      )
      .subscribe((datos) => {
        this.utilizacionFlota.set(datos);
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
