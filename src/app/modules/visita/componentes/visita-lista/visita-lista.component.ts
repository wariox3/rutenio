import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MapDirectionsService } from '@angular/google-maps';
import { RouterLink } from '@angular/router';
import { BehaviorSubject, catchError, finalize, forkJoin, of, Subject, takeUntil } from 'rxjs';
import { VisitaResumen } from '../../../../interfaces/visita/rutear.interface';
import { KTModal } from '../../../../../metronic/core';
import { General } from '../../../../common/clases/general';
import { ImportarComponent } from '../../../../common/components/importar/importar.component';
import { FilterTransformerService } from '../../../../core/servicios/filter-transformer.service';
import { ButtonComponent } from '../../../../common/components/ui/button/button.component';
import { ModalDefaultComponent } from '../../../../common/components/ui/modals/modal-default/modal-default.component';
import { AccionFila, TablaComunComponent } from '../../../../common/components/ui/tablas/tabla-comun/tabla-comun.component';
import { mapeo } from '../../../../common/mapeos/documentos';
import { GeneralService } from '../../../../common/services/general.service';
import { HttpService } from '../../../../common/services/http.service';
import { GeneralApiService } from '../../../../core';
import { SafeUrlPipe } from '../../../../common/pipes/safe-url.pipe';
import { AdminDirective } from '../../../../common/directivas/admin.directive';
import { PermisoPorDirective } from '../../../../common/directivas/permiso-por.directive';
import { ParametrosApi, RespuestaApi } from '../../../../core/types/api.type';
import { Visita } from '../../interfaces/visita.interface';
import { guiaMapeo } from '../../mapeos/guia-mapeo';
import { VisitaApiService } from '../../servicios/visita-api.service';
import { VisitaImportarPorComplementoComponent } from '../visita-importar-por-complemento/visita-importar-por-complemento.component';
import { PaginadorComponent } from '../../../../common/components/ui/paginacion/paginador/paginador.component';
import { FiltroComponent } from '../../../../common/components/ui/filtro/filtro.component';
import { FilterCondition } from '../../../../core/interfaces/filtro.interface';
import { VISITA_LISTA_FILTERS } from '../../mapeos/visita-lista-mapeo';
import { VisitaDetalleDrawerComponent } from '../visita-detalle-drawer/visita-detalle-drawer.component';

@Component({
  selector: 'app-visita-lista',
  standalone: true,
  imports: [
    CommonModule,
    ButtonComponent,
    TablaComunComponent,
    VisitaImportarPorComplementoComponent,
    ModalDefaultComponent,
    ImportarComponent,
    ReactiveFormsModule,
    RouterLink,
    PaginadorComponent,
    FiltroComponent,
    SafeUrlPipe,
    AdminDirective,
    PermisoPorDirective,
    VisitaDetalleDrawerComponent,
  ],
  templateUrl: './visita-lista.component.html',
  styleUrl: './visita-lista.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class VisitaListaComponent extends General implements OnInit {
  private _visitaApiService = inject(VisitaApiService);
  private _generalApiService = inject(GeneralApiService);
  private _directionsService = inject(MapDirectionsService);
  private _listaItemsEliminar: number[] = [];
  private _generalService = inject(GeneralService);
  private _httpService = inject(HttpService);
  private _filterTransformerService = inject(FilterTransformerService);
  private static readonly FILTRO_LOCALSTORAGE_KEY = 'visita_lista_filtro';

  public toggleModalRotuloPreview$ = new BehaviorSubject(false);
  public rotuloPreviewUrl: string | null = null;
  public rotuloCargando = false;
  public rotuloError = false;
  private _rotuloBlobUrl: string | null = null;
  private _ultimosIdsImpresion: number[] | null = null;
  private _ultimoFormatoImpresion: 'termica' | 'a4' = 'termica';

  @ViewChild(TablaComunComponent) tablaComun?: TablaComunComponent;

  public actualizandoLista = signal<boolean>(false);
  public errorLista = signal<string | null>(null);
  public resumenKpis = signal<{ total: number; sinDecodificar: number; conAlerta: number } | null>(null);
  public drawerVisitaId = signal<number | null>(null);
  public drawerAbierto = signal<boolean>(false);
  public guiaMapeo = guiaMapeo
  public VISITA_LISTA_FILTERS = VISITA_LISTA_FILTERS
  public toggleModalImportarComplemento$ = new BehaviorSubject(false);
  public toggleModalImportarExcel$ = new BehaviorSubject(false);
  public cantidadRegistros: number = 0;
  public arrGuia: any[];
  public arrGuiasOrdenadas: any[];
  public mapeoDocumento = mapeo;
  public markerPositions: google.maps.LatLngLiteral[] = [];
  public directionsResults: google.maps.DirectionsResult | undefined;
  public marcarPosicionesVisitasOrdenadas: google.maps.LatLngLiteral[] = [
    { lat: 6.200713725811437, lng: -75.58609508555918 },
  ];
  public currentPage = signal(1);
  public totalPages = signal(1);
  public totalItems: number = 0;
  public filtroKey = signal<string>('');

  private readonly arrParametrosBase: ParametrosApi = {
    limit: 50,
    ordering: '-id',
    serializador: 'lista',
  };
  arrFiltros: Record<string, any> = { page: 1 };

  public formularioFiltros = new FormGroup({
    id: new FormControl(''),
    guia: new FormControl(''),
    estado_decodificado: new FormControl('todos'),
  });
  private destroy$ = new Subject<void>();

  constructor() {
    super();
  }

  ngOnInit(): void {
    this.filtroKey.set(VisitaListaComponent.FILTRO_LOCALSTORAGE_KEY);
    // Restaurar filtros guardados en localStorage antes de la primera consulta.
    // El FiltroComponent tambien lee el storage por su cuenta para mostrar las
    // condiciones en sus inputs; aca solo los aplicamos al payload de la API.
    this.arrFiltros = {
      ...this.arrFiltros,
      ...this._restaurarFiltrosDesdeLocalStorage(),
    };
    this._consultarLista();
    this._cargarResumen();
  }

  private _cargarResumen(): void {
    this._visitaApiService.resumen()
      .pipe(
        takeUntil(this.destroy$),
        catchError(() => of(null as VisitaResumen | null)),
      )
      .subscribe((resp) => {
        if (!resp) return;
        this.resumenKpis.set({
          total: resp.resumen?.cantidad || 0,
          sinDecodificar: resp.errores?.cantidad || 0,
          conAlerta: resp.alertas?.cantidad || 0,
        });
        this.changeDetectorRef.detectChanges();
      });
  }

  /** Atajo desde los KPIs: aplica un filtro y recarga. */
  aplicarFiltroPreset(filtros: Record<string, any>): void {
    this.filterChange(filtros);
  }

  /** Etiquetas legibles para los chips de filtros activos. */
  private static readonly FILTRO_LABELS: Record<string, string> = {
    id: 'Id',
    numero: 'Número',
    destinatario: 'Destinatario',
    despacho__vehiculo__placa: 'Placa',
    fecha: 'Fecha',
    despacho_id: 'Despacho',
    estado_despacho: 'Despachado',
    estado_decodificado: 'Decodificado',
    estado_decodificado_alerta: 'Con alerta',
    estado_entregado: 'Entregado',
    estado_novedad: 'Con novedad',
  };

  /** Filtros activos derivados de arrFiltros, listos para mostrar como chips. */
  get chipsFiltrosActivos(): { key: string; label: string; valor: string }[] {
    const ignorar = new Set(['page', 'ordering', 'limit', 'serializador']);
    return Object.entries(this.arrFiltros)
      .filter(([k, v]) => !ignorar.has(k) && v !== '' && v !== null && v !== undefined)
      .map(([key, valor]) => {
        const baseKey = key.split('__')[0] in VisitaListaComponent.FILTRO_LABELS
          ? key.split('__')[0]
          : key;
        const label = VisitaListaComponent.FILTRO_LABELS[baseKey] || key;
        return { key, label, valor: this._formatearValorChip(valor) };
      });
  }

  private _formatearValorChip(valor: any): string {
    if (typeof valor === 'string') {
      if (valor.toLowerCase() === 'true') return 'Sí';
      if (valor.toLowerCase() === 'false') return 'No';
    }
    return String(valor);
  }

  removerChip(key: string): void {
    const { [key]: _, ...resto } = this.arrFiltros;
    this.arrFiltros = { ...resto, page: 1 };
    this._consultarLista();
  }

  private _restaurarFiltrosDesdeLocalStorage(): Record<string, any> {
    if (typeof localStorage === 'undefined') return {};
    try {
      const raw = localStorage.getItem(VisitaListaComponent.FILTRO_LOCALSTORAGE_KEY);
      if (!raw) return {};
      const conditions: FilterCondition[] = JSON.parse(raw);
      const validas = (Array.isArray(conditions) ? conditions : []).filter(
        (c) => c && c.field && c.operator && c.value !== undefined && c.value !== ''
      );
      if (validas.length === 0) return {};
      return this._filterTransformerService.transformToApiParams(validas) || {};
    } catch (err) {
      console.error('Error restaurando filtros visita_lista_filtro', err);
      return {};
    }
  }

  recargarConsulta() {

    this._generalApiService
      .consultaApi<RespuestaApi<Visita>>('ruteo/visita/', { limit: 50 })
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.actualizandoLista.set(false);
        })
      )
      .subscribe((respuesta) => {
        this.arrGuia = respuesta.results?.map((guia) => ({
          ...guia,
          selected: false,
          estado_dominante: this._derivarEstadoDominante(guia),
        }));
        this.cantidadRegistros = respuesta?.results?.length;
        respuesta?.results?.forEach((punto) => {
          this.addMarker({ lat: punto.latitud, lng: punto.longitud });
        });
        this.alerta.mensajaExitoso('Se ha actualizado correctamente', 'Actualizado');
        this.changeDetectorRef.detectChanges();
      });
    this._cargarResumen();
    if (this.arrGuiasOrdenadas?.length >= 1) {
      this.arrGuiasOrdenadas.forEach((punto) => {
        this.addMarkerOrdenadas({ lat: punto.latitud, lng: punto.longitud });
      });
      this.calculateRoute();
      this.changeDetectorRef.detectChanges();
    }
  }

  private _consultarLista(parametrosAdicionales: Record<string, any> = {}): void {
    this.arrFiltros = {
      ...this.arrFiltros,
      ...parametrosAdicionales,
    };

    const parametrosConsulta = {
      ...this.arrParametrosBase,
      ...this.arrFiltros,
    };

    this.actualizandoLista.set(true);
    this.errorLista.set(null);
    this.changeDetectorRef.detectChanges();

    this._generalApiService
      .consultaApi<RespuestaApi<Visita>>('ruteo/visita/', parametrosConsulta)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.actualizandoLista.set(false);
          this.changeDetectorRef.detectChanges();
        })
      )
      .subscribe({
        next: (respuesta) => this._procesarRespuestaLista(respuesta),
        error: (err) => {
          this.errorLista.set(
            err?.error?.detail || err?.error?.mensaje || err?.message || 'Error al cargar las visitas'
          );
          this.changeDetectorRef.detectChanges();
        },
      });
  }

  reintentarConsulta(): void {
    this._consultarLista();
  }

  limpiarFiltrosYRecargar(): void {
    this.arrFiltros = { page: 1 };
    if (typeof localStorage !== 'undefined') {
      try { localStorage.removeItem(VisitaListaComponent.FILTRO_LOCALSTORAGE_KEY); } catch {}
    }
    // Forzar re-render del FiltroComponent cambiando la key (ngOnChanges la detecta).
    this.filtroKey.set('');
    setTimeout(() => {
      this.filtroKey.set(VisitaListaComponent.FILTRO_LOCALSTORAGE_KEY);
      this._consultarLista();
    }, 0);
  }


  addMarker(position: google.maps.LatLngLiteral) {
    this.markerPositions.push(position);
  }

  addMarkerOrdenadas(position: google.maps.LatLngLiteral) {
    this.marcarPosicionesVisitasOrdenadas.push(position);
  }

  recargarLista(): void {
    this._consultarLista();
  }

  decodificar() {
    this._visitaApiService.decodificar().subscribe(() => {
      this._consultarLista();
      this.alerta.mensajaExitoso('Se ha decodificado correctamente');
    });
  }

  confirmarEliminarTodos() {
    this.alerta
      .confirmar({
        titulo: '¿Estás seguro?',
        texto: 'Esta operación no se puede revertir',
        textoBotonCofirmacion: 'Si, eliminar',
      })
      .then((respuesta) => {
        if (respuesta.isConfirmed) {
          this.eliminarTodosLosRegistros();
        }
      });
  }

  eliminarTodosLosRegistros() {
    if (this.arrGuia.length > 0) {
      // this.eliminandoRegistros = true;
      this._visitaApiService
        .eliminarTodos()
        .pipe(
          finalize(() => {
            // this.eliminandoRegistros = false;
            // this.isCheckedSeleccionarTodos = false;
          })
        )
        .subscribe(() => {
          this.alerta.mensajaExitoso(
            'Se han eliminado los registros correctamente.'
          );
          this._consultarLista();
        });
    } else {
      this.alerta.mensajeError(
        'No se han seleccionado registros para eliminar',
        'Error'
      );
    }
  }

  calculateRoute() {
    if (this.marcarPosicionesVisitasOrdenadas.length < 2) {
      console.error('Se necesitan al menos dos puntos para calcular la ruta.');
      return;
    }

    const origin = this.marcarPosicionesVisitasOrdenadas[0];
    const destination =
      this.marcarPosicionesVisitasOrdenadas[
      this.marcarPosicionesVisitasOrdenadas.length - 1
      ];

    const waypoints = this.marcarPosicionesVisitasOrdenadas
      .slice(1, -1)
      .map((position) => ({
        location: new google.maps.LatLng(position.lat, position.lng),
        stopover: true,
      }));

    const request: google.maps.DirectionsRequest = {
      origin: new google.maps.LatLng(origin.lat, origin.lng),
      destination: new google.maps.LatLng(destination.lat, destination.lng),
      waypoints: waypoints,
      travelMode: google.maps.TravelMode.DRIVING,
      optimizeWaypoints: false, // Cambia a true si quieres optimizar el orden de las paradas
    };

    this._directionsService.route(request).subscribe({
      next: (response) => {
        this.directionsResults = response.result;
        this.changeDetectorRef.detectChanges();
      },
      error: (e) => console.error(e),
    });
  }

  cerrarModalPorId(id: string) {
    const modalEl: HTMLElement = document.querySelector(id);
    const modal = KTModal.getInstance(modalEl);
    if (id === '#importar-por-excel-modal') {
      this.cerrarModalImportarExcel();
    }
    if (id === '#importar-por-complemento-modal') {
      this.cerrarModalImportarComplemento();
    }
    modal.hide();
  }

  abrirModalImportarExcel() {
    this.toggleModalImportarExcel$.next(true);
  }

  abrirModalImportarComplemento() {
    this.toggleModalImportarComplemento$.next(true);
  }

  cerrarModalImportarExcel() {
    this.toggleModalImportarExcel$.next(false);
  }

  cerrarModalImportarComplemento() {
    this.toggleModalImportarComplemento$.next(false);
  }

  actualizarItemsSeleccionados(itemsSeleccionados: number[]) {
    this._listaItemsEliminar = itemsSeleccionados;
  }

  get cantidadSeleccionada(): number {
    return this._listaItemsEliminar.length;
  }

  imprimirRotulosSeleccionados() {
    if (this._listaItemsEliminar.length === 0) {
      this.alerta.mensajeError('Selección vacía', 'Selecciona al menos una visita.');
      return;
    }
    this._abrirPreviewYConsultar([...this._listaItemsEliminar], 'termica');
  }

  reintentarRotulo() {
    if (this._ultimosIdsImpresion?.length) {
      this._abrirPreviewYConsultar(this._ultimosIdsImpresion, this._ultimoFormatoImpresion);
    }
  }

  imprimirRotuloDesdePreview() {
    const iframe = document.getElementById(
      'rotulo-preview-iframe-lista'
    ) as HTMLIFrameElement | null;
    if (iframe?.contentWindow) {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
    }
  }

  cerrarModalRotuloPreview() {
    this.toggleModalRotuloPreview$.next(false);
    if (this._rotuloBlobUrl) {
      URL.revokeObjectURL(this._rotuloBlobUrl);
      this._rotuloBlobUrl = null;
    }
    this.rotuloPreviewUrl = null;
    const modalEl = document.querySelector('#rotulo-preview-lista') as HTMLElement | null;
    if (modalEl) {
      KTModal.getInstance(modalEl)?.hide();
    }
  }

  private _abrirPreviewYConsultar(ids: number[], formato: 'termica' | 'a4' = 'termica') {
    this._ultimosIdsImpresion = ids;
    this._ultimoFormatoImpresion = formato;
    this.rotuloCargando = true;
    this.rotuloError = false;
    this.rotuloPreviewUrl = null;
    if (this._rotuloBlobUrl) {
      URL.revokeObjectURL(this._rotuloBlobUrl);
      this._rotuloBlobUrl = null;
    }
    this.toggleModalRotuloPreview$.next(true);
    this.changeDetectorRef.detectChanges();
    setTimeout(() => {
      const modalEl = document.querySelector('#rotulo-preview-lista') as HTMLElement | null;
      if (modalEl) {
        KTModal.getOrCreateInstance(modalEl)?.show();
      }
    }, 50);

    const payload: any = ids.length === 1 ? { id: ids[0] } : { ids };
    payload.formato = formato;
    this._httpService
      .previsualizarArchivoDominio('ruteo/visita/imprimir-rotulo/', payload)
      .subscribe({
        next: (response: any) => {
          const blob = new Blob([response.body], { type: 'application/pdf' });
          this._rotuloBlobUrl = URL.createObjectURL(blob);
          this.rotuloPreviewUrl = this._rotuloBlobUrl;
          this.rotuloCargando = false;
          this.changeDetectorRef.detectChanges();
        },
        error: () => {
          this.rotuloCargando = false;
          this.rotuloError = true;
          this.changeDetectorRef.detectChanges();
        },
      });
  }

  async eliminarItemsSeleccionados() {
    if (this._listaItemsEliminar.length === 0) {
      return;
    }

    const cantidadVisitas = this._listaItemsEliminar.length;
    const textoConfirmacion = cantidadVisitas === 1 
      ? '¿Estás seguro de que deseas eliminar esta visita?' 
      : `¿Estás seguro de que deseas eliminar estas ${cantidadVisitas} visitas?`;

    const resultado = await this.alerta.confirmar({
      titulo: 'Confirmar eliminación',
      texto: textoConfirmacion,
      textoBotonCofirmacion: 'Sí, eliminar',
      colorConfirmar: '#d33'
    });

    if (resultado.isConfirmed) {
      const eliminarRegistros = this._listaItemsEliminar.map((id) => {
        return this._visitaApiService.eliminarPorId(id);
      });

      forkJoin(eliminarRegistros)
        .pipe(
          finalize(() => {
            this._listaItemsEliminar = [];
            this._consultarLista();
            this.changeDetectorRef.detectChanges();
          })
        )
        .subscribe({
          next: () => {
            this.alerta.mensajaExitoso('Se han eliminado los registros');
          },
          error: (error) => {
            this.alerta.mensajeError(
              'Error al eliminar',
              'No se han eliminado algunos de los registros'
            );
          },
        });
    }
  }

  exportarExcel() {
    this._generalService.descargarArchivo(`ruteo/visita`, {
      ...this.arrParametrosBase,
      ...this.arrFiltros,
      limit: 5000,
      serializador: 'excel',
    });
  }

  detalleVisita(id: number) {
    // Abrir drawer en lugar de navegar — la pagina completa sigue accesible
    // desde el boton "Abrir pagina completa" dentro del drawer y vía URL directa.
    this.drawerVisitaId.set(id);
    this.drawerAbierto.set(true);
  }

  cerrarDrawerVisita(): void {
    this.drawerAbierto.set(false);
  }

  editarVisita(id: number) {
    this.router.navigateByUrl(`/movimiento/visita/editar/${id}`);
  }

  filterChange(filters: Record<string, any>) {
    const { ordering, page, ..._ } = this.arrFiltros;
    this.arrFiltros = { page: 1, ...(ordering ? { ordering } : {}), ...filters };
    this._consultarLista();
  }

  onPageChange(page: number): void {
    this._consultarLista({ page });
  }

  onOrdenamientoChange(ordering: string): void {
    if (ordering) {
      this._consultarLista({ ordering });
    } else {
      const { ordering: _, ...filtrosSinOrden } = this.arrFiltros;
      this.arrFiltros = filtrosSinOrden;
      this._consultarLista();
    }
  }

  private _procesarRespuestaLista(respuesta: RespuestaApi<Visita>, ordenarRuta = true): void {
    this.arrGuia = respuesta.results?.map((guia) => ({
      ...guia,
      selected: false,
      estado_dominante: this._derivarEstadoDominante(guia),
    })) ?? [];
    this.cantidadRegistros = respuesta?.count || 0;
    this.totalItems = respuesta?.count || 0;

    this.markerPositions = [];
    respuesta?.results?.forEach((punto) => {
      this.addMarker({ lat: punto.latitud, lng: punto.longitud });
    });

    // if (ordenarRuta) this.calculateRoute();
    this.changeDetectorRef.detectChanges();
  }

  /** Estado dominante para mostrar como un solo badge en la columna "Estado".
   *  Prioridad: novedad > entregado > despachado > pendiente. */
  private _derivarEstadoDominante(visita: any): 'novedad' | 'entregado' | 'despachado' | 'pendiente' {
    if (visita?.estado_novedad) return 'novedad';
    if (visita?.estado_entregado) return 'entregado';
    if (visita?.estado_despacho) return 'despachado';
    return 'pendiente';
  }

  /** Resalta filas con geocodificacion dudosa para que el operador las arregle. */
  resaltarFilaConAlerta = (item: any): boolean => !!item?.estado_decodificado_alerta;

  /** Acciones disponibles en el menu kebab de cada fila. Se filtran segun estado. */
  accionesFila: AccionFila[] = [
    {
      icono: 'ki-outline ki-exit-up',
      label: 'Liberar',
      mostrar: (v) => !!v.estado_despacho && !v.estado_entregado,
      ejecutar: (v) => this._liberarVisita(v.id),
    },
    {
      icono: 'ki-outline ki-package',
      label: 'Cambiar de despacho',
      mostrar: (v) => !!v.estado_despacho && !v.estado_entregado,
      ejecutar: (v) => this._cambiarDespacho(v),
    },
    {
      icono: 'ki-outline ki-printer',
      label: 'Imprimir rótulo',
      ejecutar: (v) => this._abrirPreviewYConsultar([v.id], 'termica'),
    },
    {
      icono: 'ki-outline ki-geolocation',
      label: 'Ver en Google Maps',
      mostrar: (v) => !!v.latitud && !!v.longitud,
      ejecutar: (v) => window.open(`https://www.google.com/maps?q=${v.latitud},${v.longitud}`, '_blank'),
    },
  ];

  private _liberarVisita(id: number): void {
    this.alerta.confirmar({
      titulo: '¿Liberar visita?',
      texto: 'La visita saldrá de su despacho y volverá a la lista de pendientes.',
      textoBotonCofirmacion: 'Sí, liberar',
    }).then((respuesta) => {
      if (!respuesta.isConfirmed) return;
      this._visitaApiService.liberar(String(id)).subscribe({
        next: () => {
          this.alerta.mensajaExitoso('Visita liberada');
          this._consultarLista();
          this._cargarResumen();
        },
        error: (err) => {
          this.alerta.mensajeError(
            'No se pudo liberar',
            err?.error?.detail || err?.error?.mensaje || 'Error desconocido'
          );
        },
      });
    });
  }

  private _cambiarDespacho(visita: any): void {
    // Implementacion mínima: pedir el id del nuevo despacho. Una version mas
    // pulida abriria un modal con buscador de despachos pendientes; por ahora
    // resuelve el caso comun y aprovecha el endpoint existente.
    const inputDespacho = window.prompt('ID del despacho destino:');
    if (!inputDespacho) return;
    const despachoId = Number(inputDespacho);
    if (!Number.isFinite(despachoId) || despachoId <= 0) {
      this.alerta.mensajeError('ID inválido', 'Debe ser un número positivo.');
      return;
    }
    this._visitaApiService.cambiarDespacho(visita.id, despachoId).subscribe({
      next: () => {
        this.alerta.mensajaExitoso('Visita movida al despacho ' + despachoId);
        this._consultarLista();
      },
      error: (err) => {
        this.alerta.mensajeError(
          'No se pudo cambiar',
          err?.error?.detail || err?.error?.mensaje || 'Error desconocido'
        );
      },
    });
  }

  limpiarSeleccion(): void {
    this._listaItemsEliminar = [];
    this.tablaComun?.limpiarSeleccion();
    this.changeDetectorRef.detectChanges();
  }


}
