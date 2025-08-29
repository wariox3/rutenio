import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Input,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { General } from '../../../../common/clases/general';
import { FormatFechaPipe } from '../../../../common/pipes/formatear_fecha';
import { ValidarBooleanoPipe } from '../../../../common/pipes/validar_booleano';
import { GeneralApiService } from '../../../../core';
import { Visita } from '../../../visita/interfaces/visita.interface';
import { VisitaService } from '../../../visita/servicios/visita.service';
import { ParametrosApi, RespuestaApi } from '../../../../core/types/api.type';
import { PaginadorComponent } from '../../../../common/components/ui/paginacion/paginador/paginador.component';
import { FiltroComponent } from '../../../../common/components/ui/filtro/filtro.component';
import { VISITA_TRAFICO_TAB_FILTERS } from '../../../visita/mapeos/visita-trafico-tab-mapeo';
import { GeneralService } from '../../../../common/services/general.service';

@Component({
  selector: 'app-despacho-tab-visita',
  standalone: true,
  imports: [
    CommonModule,
    ValidarBooleanoPipe,
    FormatFechaPipe,
    PaginadorComponent,
    FiltroComponent,
  ],
  templateUrl: './despacho-tab-visita.component.html',
  styleUrl: './despacho-tab-visita.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DespachoTabVisitaComponent
  extends General
  implements OnInit, OnDestroy
{
  @Input() despachoId: number;
  private _destroy$ = new Subject<void>();
  private visitaService = inject(VisitaService);
  private _generalService = inject(GeneralService);
  private _generalApiService = inject(GeneralApiService);
  public currentPage = signal(1);
  public totalPages = signal(1);
  public totalItems: number = 0;
  public cantidadRegistros: number = 0;
  public VISITA_LISTA_FILTERS = VISITA_TRAFICO_TAB_FILTERS;
  public filtroKey = signal<string>('');

  visitas = signal<Visita[]>([]);

  private baseParametrosConsulta: ParametrosApi = {
    limit: 100,
    ordering: 'orden',
    serializador: 'trafico',
  };

  private _parametrosConsulta: ParametrosApi = {};

  ngOnInit(): void {
    this._inicializarParametrosConsulta();
    this.visitaService.actualizarLista$
      .pipe(takeUntil(this._destroy$))
      .subscribe(() => {
        this.consultarVisitaPorDespacho();
      });
    this.consultarVisitaPorDespacho();
  }

  private _inicializarParametrosConsulta() {
    this.baseParametrosConsulta = {
      ...this.baseParametrosConsulta,
      despacho_id: this.despachoId.toString(),
    };
    this._parametrosConsulta = this.baseParametrosConsulta;
  }

  consultarVisitaPorDespacho() {
    if (!this.despachoId) return;

    const parametros = this._parametrosConsulta;

    this._consultarVisitaPorDespacho(parametros);
  }

  private _consultarVisitaPorDespacho(parametros: ParametrosApi) {
    this._generalApiService
      .consultaApi<RespuestaApi<Visita>>('ruteo/visita/', parametros)
      .subscribe({
        next: (respuesta) => {
          this.visitas.set(respuesta.results);
          this.cantidadRegistros = respuesta.count;
        },
        error: (error) => {
          console.error('Error al cargar visitas:', error);
        },
      });
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.unsubscribe();
  }

  filterChange(filters: Record<string, any>) {
    if (Object.keys(filters).length === 0) {
      this._parametrosConsulta = this.baseParametrosConsulta;
    } else {
      this._parametrosConsulta = {
        ...this._parametrosConsulta,
        ...filters,
      };
    }

    this._consultarVisitaPorDespacho({
      ...this._parametrosConsulta,
    });
  }

  onPageChange(page: number): void {
    const parametros = this._parametrosConsulta;

    this._generalApiService
      .consultaApi<RespuestaApi<Visita>>('ruteo/visita/', {
        ...parametros,
        page,
      })
      .subscribe({
        next: (respuesta) => {
          this.visitas.set(respuesta.results);
        },
        error: (error) => {
          console.error('Error al cargar visitas:', error);
        },
      });
  }

  exportarExcel() {
    this._generalService.descargarArchivo(`ruteo/visita`, {
      ...this._parametrosConsulta,
      limit: 5000,
      serializador: 'excel',
    });
  }

  imprimirOrdenEntrega(){
    this._generalService.imprimir('ruteo/despacho/imprimir-orden-entrega/', {
      despacho_id: this.despachoId,
    })
  }
}
