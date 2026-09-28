import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { Subject, finalize, takeUntil } from 'rxjs';
import { GeneralApiService } from '../../core';
import { RespuestaApi } from '../../core/types/api.type';
import { Visita } from '../visita/interfaces/visita.interface';
import { mapeo } from '../../common/mapeos/documentos';
import { GeneralService } from '../../common/services/general.service';
import { TablaComunComponent } from '../../common/components/ui/tablas/tabla-comun/tabla-comun.component';
import { PaginadorComponent } from '../../common/components/ui/paginacion/paginador/paginador.component';
import {
  EstadoOpcion,
  FiltroSimpleComponent,
} from '../../common/components/ui/filtro-simple/filtro-simple.component';

/**
 * Informe "Entregas por despacho": igual al listado de Visitas pero filtrado por
 * DÍA DE RUTA (fecha del despacho), con la columna "Fecha entrega" para ver
 * cuándo se entregó cada guía. Así todas las entregas de los despachos de un día
 * salen juntas, sin dispersarse por la fecha de entrega.
 */
@Component({
  selector: 'app-reporte-entregas',
  standalone: true,
  imports: [
    CommonModule,
    TablaComunComponent,
    PaginadorComponent,
    FiltroSimpleComponent,
  ],
  templateUrl: './reporte-entregas.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ReporteEntregasComponent implements OnInit, OnDestroy {
  private _api = inject(GeneralApiService);
  private _generalService = inject(GeneralService);
  private _cdr = inject(ChangeDetectorRef);
  private _destroy$ = new Subject<void>();

  public mapeoDocumento = mapeo;
  public arrGuia: any[] = [];
  public cantidadRegistros = 0;
  public actualizando = signal(false);
  public error = signal<string | null>(null);
  public currentPage = signal(1);
  public totalPages = signal(1);

  /** Estados para la barra de filtros. */
  public readonly estados: EstadoOpcion[] = [
    { label: 'Todas', params: {} },
    { label: 'Entregadas', params: { estado_entregado: 'true' } },
    { label: 'Con novedad', params: { estado_novedad: 'true' } },
    { label: 'Pendientes', params: { estado_entregado: 'false', estado_novedad: 'false' } },
  ];

  private readonly base = { limit: 50, ordering: '-fecha_entrega', serializador: 'lista' };
  arrFiltros: Record<string, any> = { page: 1 };

  ngOnInit(): void {
    // La primera consulta la dispara app-filtro-simple al emitir su estado
    // inicial (restaurado de localStorage o vacío) por (aplicar) -> filterChange.
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  filterChange(filtros: Record<string, any>): void {
    const { ordering } = this.arrFiltros;
    this.arrFiltros = { page: 1, ...(ordering ? { ordering } : {}), ...filtros };
    this._consultar();
  }

  onPageChange(page: number): void {
    this._consultar({ page });
  }

  onOrdenamientoChange(ordering: string): void {
    if (ordering) {
      this._consultar({ ordering });
    } else {
      const { ordering: _o, ...resto } = this.arrFiltros;
      this.arrFiltros = resto;
      this._consultar();
    }
  }

  reintentar(): void {
    this._consultar();
  }

  private _consultar(extra: Record<string, any> = {}): void {
    this.arrFiltros = { ...this.arrFiltros, ...extra };
    this.actualizando.set(true);
    this.error.set(null);
    this._cdr.detectChanges();

    this._api
      .consultaApi<RespuestaApi<Visita>>('ruteo/visita/', { ...this.base, ...this.arrFiltros })
      .pipe(
        takeUntil(this._destroy$),
        finalize(() => {
          this.actualizando.set(false);
          this._cdr.detectChanges();
        })
      )
      .subscribe({
        next: (respuesta) => {
          this.arrGuia = (respuesta.results ?? []).map((g: any) => ({
            ...g,
            estado_dominante: this._estadoDominante(g),
          }));
          this.cantidadRegistros = respuesta.count ?? 0;
          this._cdr.detectChanges();
        },
        error: (err) => {
          this.error.set(
            err?.error?.detail || err?.error?.mensaje || err?.message || 'Error al cargar el informe'
          );
          this._cdr.detectChanges();
        },
      });
  }

  /** Mismo criterio que la lista de Visitas: Novedad > Entregado > Despachado > Pendiente. */
  private _estadoDominante(v: any): 'novedad' | 'entregado' | 'despachado' | 'pendiente' {
    if (v?.estado_novedad) return 'novedad';
    if (v?.estado_entregado) return 'entregado';
    if (v?.estado_despacho) return 'despachado';
    return 'pendiente';
  }

  exportarExcel(): void {
    this._generalService.descargarArchivo('ruteo/visita', {
      ...this.base,
      ...this.arrFiltros,
      limit: 5000,
      serializador: 'excel',
    });
  }
}
