import { CommonModule } from '@angular/common';
import {
  Component,
  inject,
  OnInit,
  QueryList,
  signal,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  GoogleMapsModule,
  MapInfoWindow,
  MapMarker,
} from '@angular/google-maps';
import { NgSelectModule } from '@ng-select/ng-select';
import {
  BehaviorSubject,
  finalize,
  Observable,
  of,
  switchMap,
  tap,
} from 'rxjs';
import { KTModal } from '../../../../../metronic/core';
import { General } from '../../../../common/clases/general';
import { ProgresoCircularComponent } from '../../../../common/components/charts/progreso-circular/progreso-circular.component';
import { FiltroBaseComponent } from '../../../../common/components/filtros/filtro-base/filtro-base.component';
import { FiltroBaseService } from '../../../../common/components/filtros/filtro-base/services/filtro-base.service';
import { ImportarComponent } from '../../../../common/components/importar/importar.component';
import { FullLoaderDefaultComponent } from '../../../../common/components/spinners/full-loader-default/full-loader-default.component';
import { ButtonComponent } from '../../../../common/components/ui/button/button.component';
import { FiltroComponent } from '../../../../common/components/ui/filtro/filtro.component';
import { ModalDefaultComponent } from '../../../../common/components/ui/modals/modal-default/modal-default.component';
import { PaginacionDefaultComponent } from '../../../../common/components/ui/paginacion/paginacion-default/paginacion-default.component';
import { PaginadorComponent } from '../../../../common/components/ui/paginacion/paginador/paginador.component';
import { RedondearPipe } from '../../../../common/pipes/redondear.pipe';
import { FiltrosCompactosPipe } from '../../../../common/pipes/filtros-compactos.pipe';
import { GeneralApiService } from '../../../../core';
import {
  EstadoPaginacion,
  ParametrosApi,
  RespuestaApi,
} from '../../../../core/types/api.type';
import { ListaFlota } from '../../../../interfaces/flota/flota.interface';
import { Franja } from '../../../../interfaces/franja/franja.interface';
import { ParametrosConsulta } from '../../../../interfaces/general/api.interface';
import { Visita } from '../../../../interfaces/visita/visita.interface';
import { FlotaService } from '../../../flota/servicios/flota.service';
import { FranjaService } from '../../../franja/servicios/franja.service';
import { VISITA_RUTEAR_FILTERS } from '../../mapeos/visita-rutear-mapeo';
import { visitaRutearMapeo } from '../../mapeos/visita-rutear.mapeo';
import { VisitaApiService } from '../../servicios/visita-api.service';
import { VisitaEditarRutearComponent } from '../visita-editar-rutear/visita-editar-rutear.component';
import VisitaFormularioComponent from '../visita-formulario/visita-formulario.component';
import { VisitaImportarPorComplementoComponent } from '../visita-importar-por-complemento/visita-importar-por-complemento.component';
import { VisitaResumenPedienteComponent } from '../visita-resumen-pediente/visita-resumen-pediente.component';
import { AgregarFlotaComponent } from './components/agregar-flota/agregar-flota.component';
import { VisitaRutearDetalleComponent } from './components/visita-detalle/visita-rutear-detalle.component';
import { FilterTransformerService } from '../../../../core/servicios/filter-transformer.service';
import { FilterCondition } from '../../../../core/interfaces/filtro.interface';

@Component({
  selector: 'app-visita-rutear',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonComponent,
    GoogleMapsModule,
    ProgresoCircularComponent,
    ModalDefaultComponent,
    NgSelectModule,
    AgregarFlotaComponent,
    PaginacionDefaultComponent,
    ImportarComponent,
    VisitaEditarRutearComponent,
    FiltroBaseComponent,
    VisitaRutearDetalleComponent,
    FullLoaderDefaultComponent,
    VisitaResumenPedienteComponent,
    RedondearPipe,
    FiltrosCompactosPipe,
    VisitaFormularioComponent,
    VisitaImportarPorComplementoComponent,
    PaginadorComponent,
    FiltroComponent,
  ],
  templateUrl: './visita.rutear.component.html',
  styleUrl: './visita-rutear.component.css',
})
export default class VisitaRutearComponent extends General implements OnInit {
  @ViewChild(MapInfoWindow) infoWindow: MapInfoWindow;
  @ViewChildren(MapMarker) mapMarkers!: QueryList<MapMarker>;
  @ViewChild('filtroVisita') filtroVisita!: FiltroComponent;

  center: google.maps.LatLngLiteral = {
    lat: 6.200713725811437,
    lng: -75.58609508555918,
  };
  zoom = 11;
  markerPositions: any[] = [];
  polylineOptions: google.maps.PolylineOptions = {
    strokeColor: '#FF0000',
    strokeOpacity: 1.0,
    strokeWeight: 3,
  };
  directionsResults: google.maps.DirectionsResult | undefined;
  markerMap: Map<number, MapMarker> = new Map();

  public currentPage = signal(1);
  public totalPages = signal(1);

  arrParametrosConsultaFlota: ParametrosApi = {
    ordering: 'prioridad',
    // filtros: [],
    // limite: 50,
    // desplazar: 0,
    // ordenamientos: ['prioridad'],
    // limite_conteo: 10000,
    // modelo: 'RutFlota',
  };

  arrParametrosConsultaVisita: ParametrosApi = {
    ordering: 'estado_decodificado,-estado_decodificado_alerta,orden',
    estado_despacho: 'False',
    estado_devolucion: 'False',
    // limite: 50,
    // filtros: [
    //   { propiedad: 'estado_despacho', valor1: false, operador: 'exact' },
    //   { propiedad: 'estado_devolucion', valor1: false },
    // ],
    // limite: 50,
    // desplazar: 0,
    // ordenamientos: [
    //   'estado_decodificado',
    //   '-estado_decodificado_alerta',
    //   'orden',
    // ],
    // limite_conteo: 10000,
    // modelo: 'RutVisita',
  };

  arrParametrosConsultaResumen: any = {
    filtros: [],
    // limite: 50,
    desplazar: 0,
    ordenamientos: [
      'estado_decodificado',
      '-estado_decodificado_alerta',
      'orden',
    ],
    limite_conteo: 10000,
    modelo: 'RutVisita',
  };

  arrFlota = signal<ListaFlota[]>([]);
  arrVisitas: Visita[];
  public flotasSeleccionadas: number[] = [];
  public capacidadTotal: number = 0;
  public pesoTotal: number = 0;
  public servicio = signal<number>(0);
  public tiempoTotal = signal<number>(0);
  public porcentajeCapacidad: number = 0;
  public porcentajeTiempo: number = 0;
  public errorTiempo: boolean = false;
  public barraTiempo: number = 0;
  public barraCapacidad: number = 0;
  public errorCapacidad: boolean = false;
  public cantidadErrores: number = 0;
  public cantidadAlertas: number = 0;
  public cantidadNovedades: number = 0;
  public visitasTotales: number = 0;
  public unidadesTotales: number = 0;
  public totalRegistrosVisitas: number = 0;
  public mapeo = visitaRutearMapeo;
  public valoresFiltrados: string = '';
  public mostarVistaCargando$: BehaviorSubject<boolean>;
  public cargandoConsultas$: BehaviorSubject<boolean>;
  public franjas$: Observable<Franja[]>;
  public mostrarFranjas$: BehaviorSubject<boolean>;
  public toggleModalImportarPorExcel$ = new BehaviorSubject(false);
  public toggleModalImportarPorComplemento$ = new BehaviorSubject(false);
  public toggleModalAgregarFlota$ = new BehaviorSubject(false);
  public toggleModalFiltros$ = new BehaviorSubject(false);
  public toggleModalVisitaResumen$ = new BehaviorSubject(false);
  public toggleModalVisitaNuevo$ = new BehaviorSubject(false);
  public toggleModalVisitaEditar$ = new BehaviorSubject(false);
  public toggleModalVisitaDetalle$ = new BehaviorSubject(false);
  public toggleModalFlotas$ = new BehaviorSubject(false);
  public cantidadRegistros: number = 0;
  public VISITA_RUTEAR_FILTERS = VISITA_RUTEAR_FILTERS;
  public filtroKey = signal<string>('filtro_visita_rutear');
  private filtrosActivos = signal<ParametrosApi>({});
  public estadoPaginacion = signal<EstadoPaginacion>({
    paginaActual: 1,
    itemsPorPagina: 30,
    totalItems: 0,
  });

  private _flotaService = inject(FlotaService);
  private _filtroBaseService = inject(FiltroBaseService);
  private _generalApiService = inject(GeneralApiService);
  private _visitaApiService = inject(VisitaApiService);
  private _franjaService = inject(FranjaService);
  private _filterTransformerService = inject(FilterTransformerService);
  selectedVisita: any = null;
  visitarEditar: any;
  datos: any[];
  visitaResumen: any;

  constructor() {
    super();
    this.cargandoConsultas$ = new BehaviorSubject(false);
    this.mostarVistaCargando$ = new BehaviorSubject(false);
    this.mostrarFranjas$ = new BehaviorSubject(false);
  }

  ngOnInit(): void {
    this._aplicarFiltrosPermanentes();
    this._initView();
    this._initListeners();
  }

  private _initListeners() {
    this._filtroBaseService.myEvent.subscribe({});
  }

  private _aplicarFiltrosPermanentes() {
    const filtroKey = this.filtroKey();
    let filtrosStorage = localStorage.getItem(filtroKey);

    if (filtrosStorage === null) {
      return null;
    }

    const filtrosParseados = JSON.parse(filtrosStorage);
    const filtrosPost =
      this._filterTransformerService.transformToApiPostParams(filtrosParseados);
    const filtrosTransformados =
      this._filterTransformerService.transformToApiParams(filtrosParseados);
    this.valoresFiltrados = Object.values(filtrosTransformados)
      .filter((value) => value !== null && value !== undefined && value !== '')
      .join(', ');

    this.filtrosActivos.set({
      ...filtrosTransformados,
    });

    this.arrParametrosConsultaResumen = {
      ...this.arrParametrosConsultaResumen,
      filtros: [...this.arrParametrosConsultaResumen.filtros, ...filtrosPost],
    };

    // this._actualizarFiltrosParaMostrar(parametrosConsulta);
  }

  private _initView() {
    this._consultarResumen()
      .pipe(
        switchMap(() => {
          this.consultarLista();
          return of(null);
        })
      )
      .subscribe();

    this.consultarFranjas();
  }

  consultarLista() {
    this.consultarFlotas(this.arrParametrosConsultaFlota);
    this._consultarVisitas(this.arrParametrosConsultaVisita);
  }

  consultarVisitas() {
    this._consultarResumen()
      .pipe(
        switchMap(() => {
          this._consultarVisitas(this.arrParametrosConsultaVisita);
          return of(null);
        })
      )
      .subscribe();
  }

  private _consultarResumen() {
    return this._visitaApiService
      .resumen(this.arrParametrosConsultaResumen)
      .pipe(
        switchMap((response) => {
          this.unidadesTotales = response?.resumen?.unidades;
          this.visitasTotales = response?.resumen?.cantidad;
          this.cantidadErrores = response?.errores?.cantidad;
          this.cantidadAlertas = response?.alertas?.cantidad;
          this.pesoTotal = response?.resumen?.peso;
          this.servicio.set(this._redondear(response.resumen.tiempo, 0));
          this.changeDetectorRef.detectChanges();
          return of(null);
        })
      );
  }

  private _limpiarBarraCapacidad() {
    this.barraCapacidad = 0;
    this.errorCapacidad = false;
    this.porcentajeCapacidad = 0;
    this.changeDetectorRef.detectChanges();
  }

  private _limpiarBarraTiempo() {
    this.barraTiempo = 0;
    this.errorTiempo = false;
    this.porcentajeTiempo = 0;
    this.changeDetectorRef.detectChanges();
  }

  private _consultarVisitas(parametros: ParametrosApi) {
    const params = {
      ...this.arrParametrosConsultaVisita,
      ...this.filtrosActivos(),
      ...parametros,
      page: this.estadoPaginacion().paginaActual,
    };
    this._generalApiService
      .consultaApi<RespuestaApi<Visita>>('ruteo/visita/', params)
      .subscribe((respuesta) => this._procesarRespuestaVisita(respuesta));
  }

  consultarFranjas() {
    this.franjas$ = this._franjaService.consultarFranjas().pipe(
      switchMap((respuesta) => {
        return of(respuesta.results);
      })
    );
  }

  toggleMostrarFranjas() {
    const currentValue = this.mostrarFranjas$.getValue();
    this.mostrarFranjas$.next(!currentValue);
  }

  consultarFlotas(parametros: ParametrosApi) {
    this.cargandoConsultas$.next(true);
    this._generalApiService
      .consultaApi<RespuestaApi<ListaFlota>>('ruteo/flota/', parametros)
      .pipe(finalize(() => this.cargandoConsultas$.next(false)))
      .subscribe((response) => {
        this.flotasSeleccionadas = response.results.map(
          (registro) => registro.vehiculo_id
        );

        this._calcularCapacidadTotal(response.results);
        this._calcularTiempoTotal(response.results);
        this._calcularPorcentajeCapacidad();
        this._calcularPorcentajeTiempo();
        this.arrFlota.set(response.results);
        this.changeDetectorRef.detectChanges();
      });
  }

  paginar(evento: { limite: number; desplazar: number }) {
    const parametrosConsulta: ParametrosApi = {
      ...this.arrParametrosConsultaVisita,
      limite: evento.limite,
      desplazar: evento.desplazar,
    };

    this.arrParametrosConsultaVisita = parametrosConsulta;

    this._consultarVisitas(parametrosConsulta);
  }

  private _calcularPorcentajeCapacidad() {
    let porcentaje = 0;
    if (this.capacidadTotal > 0) {
      porcentaje = (this.pesoTotal / this.capacidadTotal) * 100;
    }

    this.porcentajeCapacidad = porcentaje;

    if (this.pesoTotal === 0) {
      this.barraCapacidad = 0;
      this.errorCapacidad = true;
    } else if (porcentaje > 100) {
      this.barraCapacidad = 100;
      this.errorCapacidad = true;
    } else {
      this.barraCapacidad = porcentaje;
      this.errorCapacidad = false;
    }
  }

  private _calcularPorcentajeTiempo() {
    let total = 0;
    if (this.tiempoTotal() > 0) {
      total = (this.servicio() / this.tiempoTotal()) * 100;
    }

    // Redondear a 2 decimales para evitar problemas de UI
    this.porcentajeTiempo = Math.round(total * 100) / 100;
    this.porcentajeTiempo = 200

    if (this.porcentajeTiempo > 100) {
      this.barraTiempo = 100;
      this.errorTiempo = true;
    } else if (this.porcentajeTiempo === 0) {
      this.barraTiempo = 0;
      this.errorTiempo = true;
    } else {
      this.barraTiempo = this.porcentajeTiempo;
      this.errorTiempo = false;
    }
  }

  private _calcularCapacidadTotal(flotas: ListaFlota[]) {
    const flotasDisponibles = flotas.filter(
      (f) => f.vehiculo_estado_asignado === false
    );
    this.capacidadTotal = flotasDisponibles.reduce(
      (acc, curVal) => acc + curVal.vehiculo_capacidad,
      0
    );
  }

  private _calcularTiempoTotal(flotas: ListaFlota[]) {
    const flotasDisponibles = flotas.filter(
      (f) => f.vehiculo_estado_asignado === false
    );
    const tiempoTotal = flotasDisponibles.reduce(
      (acc, curVal) => acc + curVal.vehiculo_tiempo,
      0
    );
    this.tiempoTotal.set(tiempoTotal);
  }

  private _redondear(valor: number, decimales: number): number {
    const factor = Math.pow(10, decimales);
    return Math.round(valor * factor) / factor;
  }

  ordenar() {
    this.mostarVistaCargando$.next(true);
    const filtros = this.arrParametrosConsultaResumen.filtros;
    this._visitaApiService
      .ordenar(filtros)
      .pipe(
        finalize(() => {
          this.mostarVistaCargando$.next(false);
        })
      )
      .subscribe(() => {
        this.consultarFlotas(this.arrParametrosConsultaFlota);
        this.consultarVisitas();
        this.alerta.mensajaExitoso('Se ha ordenado correctamente');
      });
  }

  rutear() {
    this._visitaApiService
      .rutear(this.arrParametrosConsultaResumen)
      .subscribe(() => {
        this.consultarLista();
        this.alerta.mensajaExitoso('Se ha ruteado correctamente correctamente');
        this.router.navigate(['/diseno-ruta/lista']);
      });
  }

  addMarker(position: google.maps.LatLngLiteral, visita: any) {
    this.markerPositions.push({
      position,
      infoContent: {
        datosVisita: visita,
      },
    });
  }

  ngAfterViewInit() {
    this.mapMarkers.changes.subscribe(() => {
      this.mapMarkers.forEach((marker, index) => {
        const visita = this.arrVisitas[index];
        if (visita) {
          this.markerMap.set(visita.id, marker);
        }
      });
    });
  }

  limpiarMarkers() {
    this.markerPositions = [];
  }

  openInfoWindow(marker: MapMarker, index: number) {
    this.selectedVisita = this.arrVisitas[index];
    this.scrollToRow(this.selectedVisita.id);
    this.infoWindow.open(marker);
  }

  scrollToRow(index: number): void {
    if (window.innerWidth >= 1280) {
      const row = document.getElementById(`fila-${index}`);
      if (row) {
        row.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }

  abrirModalImportarExcel() {
    this.toggleModalImportarPorExcel$.next(true);
  }

  abrirModalDetalleVisita() {
    this.toggleModalVisitaDetalle$.next(true);
  }

  abrirModalImportarPorComplemento() {
    this.toggleModalImportarPorComplemento$.next(true);
  }

  abrirModalAgregarFlota() {
    this.toggleModalAgregarFlota$.next(true);
  }

  abrirModalFiltros() {
    this.toggleModalFiltros$.next(true);
  }

  abrirModalVisitaNuevo() {
    this.toggleModalVisitaNuevo$.next(true);
  }

  abrirModalFlotas() {
    this.toggleModalFlotas$.next(true);
  }

  cerrarModalImportarPorExcel() {
    this.toggleModalImportarPorExcel$.next(false);
  }

  cerrarModalImportarPorComplemento() {
    this.toggleModalImportarPorComplemento$.next(false);
  }

  cerrarModalVisitaNuevo() {
    this.toggleModalVisitaNuevo$.next(false);
  }

  cerrarModalEditarVisita() {
    this.toggleModalVisitaEditar$.next(false);
  }

  cerrarModalVisitaDetalle() {
    this.toggleModalVisitaDetalle$.next(false);
  }

  cerrarModalFlotas() {
    this.toggleModalFlotas$.next(false);
  }

  cerrarModalFiltrosVisita() {
    this.toggleModalFlotas$.next(false);
  }

  eliminarFlota(id: number) {
    this._flotaService.eliminarFlota(id).subscribe((response) => {
      this.consultarFlotas(this.arrParametrosConsultaFlota);
      this.alerta.mensajaExitoso('Flota eliminada');
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
          this._eliminarTodosLosRegistros();
        }
      });
  }

  confirmarEliminarErrores() {
    this.alerta
      .confirmar({
        titulo: '¿Estás seguro?',
        texto: 'Esta acción elimina las visitas con errores',
        textoBotonCofirmacion: 'Si, eliminar',
      })
      .then((respuesta) => {
        if (respuesta.isConfirmed) {
          this._eliminarVisitasConErrores();
        }
      });
  }

  private _eliminarVisitasConErrores() {
    if (this.arrVisitas.length > 0) {
      this._visitaApiService.eliminarTodosConErrores().subscribe((response) => {
        this.alerta.mensajaExitoso(
          'Se han eliminado los registros correctamente.'
        );
        this.consultarVisitas();
      });
    } else {
      this.alerta.mensajeError('No hay visitas para eliminar', 'Error');
    }
  }

  private _eliminarTodosLosRegistros() {
    if (this.arrVisitas.length > 0) {
      this._visitaApiService
        .eliminarTodos()
        .pipe(finalize(() => {}))
        .subscribe(() => {
          this.alerta.mensajaExitoso(
            'Se han eliminado los registros correctamente.'
          );
          this.consultarVisitas();
        });
    } else {
      this.alerta.mensajeError('No hay visitas para eliminar', 'Error');
    }
  }

  cerrarModalPorId(id: string) {
    const modalEl: HTMLElement = document.querySelector(id);
    const modal = KTModal.getInstance(modalEl);
    this.toggleModalImportarPorExcel$.next(false);

    modal.toggle();
  }

  cerrarModalFiltrosPorId(id: string) {
    const modalEl: HTMLElement = document.querySelector(id);
    const modal = KTModal.getInstance(modalEl);
    this.toggleModalFiltros$.next(false);

    modal.toggle();
  }

  cerrarModalVisitaNuevoEmitir() {
    const modalEl: HTMLElement = document.querySelector('#nuevo-visita');
    const modal = KTModal.getInstance(modalEl);
    this.toggleModalVisitaNuevo$.next(false);

    modal.toggle();
    this.consultarVisitas();
  }

  habilitadoParaRutear() {
    return (
      this.errorCapacidad ||
      this.arrFlota()?.length <= 0 ||
      this.cantidadErrores > 0 ||
      this.visitasTotales <= 0 ||
      this.errorTiempo
    );
  }

  evento(visita: any) {
    this.selectedVisita = visita;
    this.center = { lat: visita.latitud, lng: visita.longitud };
    const marker = this.markerMap.get(visita.id);
    if (marker) {
      this.infoWindow.open(marker);
    }
  }

  editarModalVisita(visita) {
    this.toggleModalVisitaEditar$.next(true);
    this.visitarEditar = visita;
  }

  visitaActualizada(id: string) {
    this.cerrarModalPorId(id);
    this.consultarVisitas();
  }

  filtrosPersonalizados(filtros: any[], modalId: string) {
    if (filtros.length >= 1) {
      //   this.arrParametrosConsultaVisita.filtros = [
      //     { propiedad: 'estado_despacho', valor1: false },
      //     { propiedad: 'estado_devolucion', valor1: false },
      //     ...filtros,
      //   ];
      //   this.arrParametrosConsultaResumen.filtros = [...filtros];
      // } else {
      //   this.arrParametrosConsultaVisita.filtros = [
      //     { propiedad: 'estado_despacho', valor1: false },
      //     { propiedad: 'estado_devolucion', valor1: false },
      //   ];
      //   this.arrParametrosConsultaResumen.filtros = [];
    }

    this.consultarVisitas();

    this.cerrarModalPorId(modalId);
  }

  ubicarFranja() {
    this.mostarVistaCargando$.next(true);
    this._visitaApiService
      .ubicarFranja(this.arrParametrosConsultaVisita)
      .pipe(
        finalize(() => {
          this.mostarVistaCargando$.next(false);
        })
      )
      .subscribe((response) => {
        this.alerta.mensajaExitoso(response.mensaje);
        this.consultarVisitas();
      });
  }

  confirmarEliminarVisita(id: number) {
    this.alerta
      .confirmar({
        titulo: '¿Estás seguro?',
        texto: 'Esta operación no se puede revertir',
        textoBotonCofirmacion: 'Si, eliminar',
      })
      .then((respuesta) => {
        if (respuesta.isConfirmed) {
          this.eliminarVisita(id);
        }
      });
  }

  eliminarVisita(id: number) {
    this._visitaApiService.eliminarPorId(id).subscribe({
      next: (response) => {
        this.alerta.mensajaExitoso('Visita eliminada exitosamente');
        this.consultarVisitas();
      },
    });
  }

  abrirModalResumen() {
    this.toggleModalVisitaResumen$.next(true);
    this.resumen();
  }

  resumen() {
    const filtros = this.arrParametrosConsultaResumen.filtros;
    this._visitaApiService.resumenPendiente(filtros).subscribe({
      next: (response) => {
        this.visitaResumen = response.resumen;
        this.changeDetectorRef.detectChanges();
      },
    });
  }

  limpiarFiltros(event: Event) {
    event.stopPropagation();
    this.valoresFiltrados = '';
    this.filtroVisita?.clearFiltersFromLocalStorage();
    this.actualizarFiltros([]);
    this._initView();
  }

  get vehiculosDisponibles(): number {
    return (
      this.arrFlota()?.filter((v) => !v.vehiculo_estado_asignado).length || 0
    );
  }

  get totalVehiculos(): number {
    return this.arrFlota()?.length || 0;
  }

  actualizarPrioridad(event: Event, flota: ListaFlota) {
    const prioridad = (event.target as HTMLInputElement).value;
    if (flota.prioridad === Number(prioridad) || !prioridad) {
      return;
    }

    this._flotaService
      .actualizarPrioridad(flota.id, Number(prioridad))
      .subscribe({
        next: () => {
          this.alerta.mensajaExitoso('Prioridad actualizada exitosamente');
          this.consultarFlotas(this.arrParametrosConsultaFlota);
        },
      });
  }

  onPageChange(page: number): void {
    this.estadoPaginacion.update((estado) => ({
      ...estado,
      paginaActual: page,
    }));
    this._consultarVisitas(this.filtrosActivos());
  }

  filterChange(filters: FilterCondition[]) {
    this.actualizarFiltros(filters);
    this.cerrarModalFiltrosPorId('#filtros-visita');
  }

  actualizarFiltros(filters: FilterCondition[]) {
    const filtrosTransformados =
      this._filterTransformerService.transformToApiParams(filters);
    this._actualizarFiltrosPost(filters);
    this.valoresFiltrados = Object.values(filtrosTransformados)
      .filter((value) => value !== null && value !== undefined && value !== '')
      .join(', ');
    this.filtrosActivos.set(filtrosTransformados);
    this.ordenar();
  }

  private _actualizarFiltrosPost(filters: FilterCondition[]) {
    const filtrosPost =
      this._filterTransformerService.transformToApiPostParams(filters);
    this.arrParametrosConsultaResumen.filtros = [...filtrosPost];
  }

  private _procesarRespuestaVisita(respuesta: RespuestaApi<Visita>): void {
    this.limpiarMarkers();
    this._limpiarBarraCapacidad();
    this._limpiarBarraTiempo();
    this.totalRegistrosVisitas = respuesta.count;

    respuesta.results.forEach((visita) => {
      const position = { lat: visita.latitud, lng: visita.longitud };
      this.addMarker(position, visita);
    });

    this._calcularPorcentajeCapacidad();
    this._calcularPorcentajeTiempo();
    this.arrVisitas = respuesta.results;
    this.cantidadRegistros = respuesta.count;
    this.changeDetectorRef.detectChanges();
  }
}
