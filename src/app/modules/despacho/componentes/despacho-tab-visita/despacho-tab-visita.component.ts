import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
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
import { VisitaApiService } from '../../../visita/servicios/visita-api.service';
import { ParametrosApi, RespuestaApi } from '../../../../core/types/api.type';
import { PaginadorComponent } from '../../../../common/components/ui/paginacion/paginador/paginador.component';
import { FiltroComponent } from '../../../../common/components/ui/filtro/filtro.component';
import { VISITA_TRAFICO_TAB_FILTERS } from '../../../visita/mapeos/visita-trafico-tab-mapeo';
import { GeneralService } from '../../../../common/services/general.service';
import { VisitaDetalleDrawerComponent } from '../../../visita/componentes/visita-detalle-drawer/visita-detalle-drawer.component';

@Component({
  selector: 'app-despacho-tab-visita',
  standalone: true,
  imports: [
    CommonModule,
    ValidarBooleanoPipe,
    FormatFechaPipe,
    PaginadorComponent,
    FiltroComponent,
    VisitaDetalleDrawerComponent,
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
  private _visitaApiService = inject(VisitaApiService);
  private _generalService = inject(GeneralService);
  private _generalApiService = inject(GeneralApiService);
  public currentPage = signal(1);
  public totalPages = signal(1);
  public totalItems: number = 0;
  public cantidadRegistros: number = 0;
  public VISITA_LISTA_FILTERS = VISITA_TRAFICO_TAB_FILTERS;
  public filtroKey = signal<string>('');

  visitas = signal<Visita[]>([]);
  drawerAbierto = signal<boolean>(false);
  drawerVisitaId = signal<number | null>(null);

  // KPIs derivados — se actualizan solos cuando cambia la lista.
  totalVisitas = computed(() => this.visitas().length);
  entregadas = computed(
    () => this.visitas().filter((v) => v.estado_entregado).length
  );
  conNovedad = computed(
    () =>
      this.visitas().filter((v) => v.estado_novedad && !v.estado_entregado)
        .length
  );
  pendientes = computed(
    () =>
      this.totalVisitas() - this.entregadas() - this.conNovedad()
  );
  pctEntregadas = computed(() =>
    this.totalVisitas() > 0
      ? Math.round((this.entregadas() / this.totalVisitas()) * 100)
      : 0
  );
  pctNovedad = computed(() =>
    this.totalVisitas() > 0
      ? Math.round((this.conNovedad() / this.totalVisitas()) * 100)
      : 0
  );

  abrirDrawer(id: number): void {
    this.drawerVisitaId.set(id);
    this.drawerAbierto.set(true);
  }

  cerrarDrawer(): void {
    this.drawerAbierto.set(false);
  }

  esCitaObligatoriaVencida(v: any): boolean {
    if (!v?.cita_fin) return false;
    const tipo = v.cita_tipo || 'obligatoria';
    if (tipo !== 'obligatoria') return false;
    return new Date(v.cita_fin).getTime() < Date.now();
  }

  // --- Modelo de estado en DOS dimensiones independientes ------------------
  // El badge viejo mezclaba "¿se entregó?" con "¿la dirección está bien?", así
  // que una visita pendiente con dirección ambigua se veía solo como "Alerta"
  // y el operador no sabía si faltaba entregarla o corregir el dato.

  // 1) ENTREGA — lo único que decide si la visita bloquea el cierre.
  estadoEntrega(v: Visita): 'entregada' | 'novedad' | 'pendiente' {
    if (v.estado_entregado) return 'entregada';
    if (v.estado_novedad) return 'novedad';
    return 'pendiente';
  }

  // 2) DIRECCION — calidad del geocodificado, contexto secundario.
  problemaDireccion(
    v: Visita
  ): { tipo: 'sin-ubicar' | 'ambigua'; label: string; detalle: string } | null {
    if (v.estado_decodificado === false || v.estado_decodificado == null) {
      return {
        tipo: 'sin-ubicar',
        label: 'Sin ubicar',
        detalle:
          'La dirección no se pudo ubicar en el mapa (sin coordenadas). Corregila para poder rutear esta visita.',
      };
    }
    if (v.estado_decodificado_alerta) {
      const n = v.resultados?.length;
      return {
        tipo: 'ambigua',
        label: 'Dirección ambigua',
        detalle: n
          ? `La dirección coincidió con ${n} ubicaciones posibles. Verificá cuál es la correcta antes de rutear.`
          : 'La dirección coincidió con varias ubicaciones posibles. Verificá cuál es la correcta antes de rutear.',
      };
    }
    return null;
  }

  // --- Filtro por estado (en cliente, instantáneo) -------------------------
  filtroEstado = signal<
    'todas' | 'pendiente' | 'entregada' | 'novedad' | 'direccion'
  >('todas');

  alternarFiltro(
    f: 'todas' | 'pendiente' | 'entregada' | 'novedad' | 'direccion'
  ): void {
    this.filtroEstado.set(this.filtroEstado() === f ? 'todas' : f);
  }

  visitasFiltradas = computed<Visita[]>(() => {
    const f = this.filtroEstado();
    const list = this.visitas();
    switch (f) {
      case 'pendiente':
        return list.filter((v) => this.estadoEntrega(v) === 'pendiente');
      case 'entregada':
        return list.filter((v) => !!v.estado_entregado);
      case 'novedad':
        return list.filter((v) => !!v.estado_novedad && !v.estado_entregado);
      case 'direccion':
        return list.filter((v) => !!this.problemaDireccion(v));
      default:
        return list;
    }
  });

  // Visitas con problema de dirección (para el chip-filtro secundario).
  conProblemaDireccion = computed(
    () => this.visitas().filter((v) => !!this.problemaDireccion(v)).length
  );

  // Solo las que bloquean el cierre del despacho (ni entregadas ni con novedad)
  // se pueden liberar; el backend 'liberar' permite hacerlo aun con el despacho
  // aprobado, que es el estado normal en trafico.
  puedeLiberar(v: Visita): boolean {
    return !v.estado_entregado && !v.estado_novedad;
  }

  liberarVisita(visita: Visita, event: Event): void {
    event.stopPropagation();
    const ref = `${visita.numero || visita.id} ${visita.destinatario ?? ''}`.trim();
    this.alerta
      .confirmar({
        titulo: '¿Liberar esta visita?',
        texto: `Se quitará "${ref}" del despacho para poder cerrarlo. La visita quedará disponible para reasignar.`,
        textoBotonCofirmacion: 'Sí, liberar',
      })
      .then((respuesta) => {
        if (!respuesta.isConfirmed) return;
        this._visitaApiService
          .liberar(visita.id.toString())
          .pipe(takeUntil(this._destroy$))
          .subscribe({
            next: (resp) => {
              this.alerta.mensajaExitoso(resp?.mensaje || 'Se liberó la visita');
              this.consultarVisitaPorDespacho();
              this.visitaService.notificarActualizacionLista();
            },
          });
      });
  }

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
