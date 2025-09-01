import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnDestroy,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import {
  GoogleMapsModule,
  MapDirectionsService,
  MapInfoWindow,
  MapMarker,
} from '@angular/google-maps';
import { BehaviorSubject, finalize, Observable, Subject, takeUntil } from 'rxjs';
import { KTModal } from '../../../../../metronic/core';
import { General } from '../../../../common/clases/general';
import { ButtonComponent } from '../../../../common/components/ui/button/button.component';
import { ModalDefaultComponent } from '../../../../common/components/ui/modals/modal-default/modal-default.component';
import { FormatFechaPipe } from '../../../../common/pipes/formatear_fecha';
import { RedondearPipe } from '../../../../common/pipes/redondear.pipe';
import { GeneralService } from '../../../../common/services/general.service';
import { GeneralApiService } from '../../../../core';
import {
  Despacho,
  DespachoDetalle,
} from '../../../../interfaces/despacho/despacho.interface';
import { ParametrosConsulta } from '../../../../interfaces/general/api.interface';
import { Ubicacion } from '../../../../interfaces/ubicacion/ubicacion.interface';
import { Visita } from '../../../../interfaces/visita/visita.interface';
import { VisitaAdicionarTraficoComponent } from '../../../despacho/componentes/despacho-adicionar-visita-trafico/despacho-adicionar-visita-trafico.component';
import { VisitaAdicionarPendienteComponent } from '../../../despacho/componentes/despacho-adicionar-visita/despacho-adicionar-visita-pendiente.component';
import DespachoFormularioComponent from '../../../despacho/componentes/despacho-formulario/despacho-formulario.component';
import { DespachoTabUbicacionComponent } from '../../../despacho/componentes/despacho-tab-ubicacion/despacho-tab-ubicacion.component';
import { DespachoTabVisitaComponent } from '../../../despacho/componentes/despacho-tab-visita/despacho-tab-visita.component';
import { DespachoApiService } from '../../../despacho/servicios/despacho-api.service';
import { NovedadService } from '../../../novedad/servicios/novedad.service';
import { VisitaLiberarComponent } from '../../../visita/componentes/visita-liberar/visita-liberar.component';
import { ModalService } from '../../../../common/components/ui/modals/service/modal.service';
import { ModalStandardComponent } from "../../../../common/components/ui/modals/modal-standard/modal-standard.component";
import { ParametrosApi, RespuestaApi } from '../../../../core/types/api.type';
import { DespachoTrasbordarComponent } from "../../../despacho/componentes/despacho-trasbordar/despacho-trasbordar.component";
import { TraficoService } from '../../servicios/trafico.service';

@Component({
  selector: 'app-trafico-lista',
  standalone: true,
  imports: [
    CommonModule,
    FormatFechaPipe,
    ModalDefaultComponent,
    GoogleMapsModule,
    RedondearPipe,
    DespachoTabVisitaComponent,
    DespachoTabUbicacionComponent,
    VisitaLiberarComponent,
    DespachoFormularioComponent,
    VisitaAdicionarTraficoComponent,
    ButtonComponent,
    VisitaAdicionarPendienteComponent,
    ModalStandardComponent,
    DespachoTrasbordarComponent
],
  templateUrl: './trafico-lista.component.html',
  styleUrl: './trafico-lista.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TraficoListaComponent
  extends General
  implements OnInit, OnDestroy
{
  @ViewChild(MapInfoWindow) infoWindow: MapInfoWindow;
  private _despachoApiService = inject(DespachoApiService);
  private _generalService = inject(GeneralService);
  private _modalService = inject(ModalService);
  private directionsService = inject(MapDirectionsService);
  private _generalApiService = inject(GeneralApiService);
  private destroy$ = new Subject<void>();
  private _traficoService = inject(TraficoService);
  private novedadService = inject(NovedadService);

  public visitaSeleccionada: Visita;
  public despachoSeleccionado: Despacho;
  public novedades = signal<string[]>([]);
  public mostarModalDetalleVisita$ = new BehaviorSubject<boolean>(false);
  public toggleModal$ = new BehaviorSubject(false);
  public toggleModalRuta$ = new BehaviorSubject(false);
  public toggleModalAdicionarVisita$ = new BehaviorSubject(false);
  public toggleModalAdicionarVisitaTrafico$ = new BehaviorSubject(false);
  public toggleModalLiberar$ = new BehaviorSubject(false);
  public toggleModalUbicacion$ = new BehaviorSubject(false);
  public toggleModalTrasbordarTrafico$ = new BehaviorSubject(false);
  public actualizandoLista = signal<boolean>(false);


  customMarkers: any[] = [];
  mostrarMapaFlag = false;
  center: google.maps.LatLngLiteral = {
    lat: 6.200713725811437,
    lng: -75.58609508555918,
  };
  zoom = 11;
  marcarPosicionesVisitasOrdenadas: google.maps.LatLngLiteral[] = [];
  marcarPosicionesUbicacionesOrdenadas: google.maps.LatLngLiteral[] = [];
  polylineOptions: google.maps.PolylineOptions = {
    strokeColor: '#FF0000',
    strokeOpacity: 1.0,
    strokeWeight: 3,
  };

  arrParametrosConsulta: ParametrosApi = {
    limit : 50,
    ordering : 'id',
    serializador : 'trafico',
    estado_aprobado : 'True',
    estado_terminado : 'False',
    estado_anulado : 'False',
  };

  arrDespachos: Despacho[] = [];
  arrVisitasPorDespacho: Visita[] = [];
  selectedDespachoId: number | null = null;
  private map: google.maps.Map;
  selectedMarkerInfo: any;
  activeTab: string = 'visitas';
  arrUbicaciones: any[] = [];
  mostrarUbicaciones = false;
  directionsResultsVisitas: google.maps.DirectionsResult;
  directionsResultsUbicaciones: google.maps.DirectionsResult;
  despachoIdActual: number | null = null;
  lineasConectoras: google.maps.LatLng[][] = [];
  private MAX_WAYPOINTS = 23;
  directionsResultsUbicacionesArray;
  customUbicacionMarkers: {
    position: google.maps.LatLngLiteral;
    label: string;
  }[] = [];

  constructor() {
    super();
  }

  ngOnInit(): void {
    this.consultarLista();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private limpiarInformacionAdicional() {
    this.arrVisitasPorDespacho = [];
    this.customMarkers = [];
    this.directionsResultsVisitas = undefined;
    this.directionsResultsUbicaciones = undefined;
    this.changeDetectorRef.detectChanges();
  }

  consultarLista() {
    this._generalApiService
      .consultaApi<RespuestaApi<Despacho>>('ruteo/despacho/',this.arrParametrosConsulta)
      .pipe(takeUntil(this.destroy$))
      .subscribe((respuesta) => {
        this.arrDespachos = this._traficoService.agregarEstadoDespacho(respuesta.results);
        this.changeDetectorRef.detectChanges();
      });
  }

  private consultarVisitas(despachoId: number) {
    const parametrosConsultaVisitas: ParametrosApi = {
      limit : 50,
      ordering : 'orden',
      despacho_id : despachoId.toString(),
    };

    return this._generalApiService.consultaApi<RespuestaApi<Visita>>('ruteo/visita/', parametrosConsultaVisitas).pipe(takeUntil(this.destroy$));
  }

  private consultarUbicacion(despachoId: number) {
    const parametrosConsultaUbicacion: ParametrosApi = {
      ordering: '-fecha',
      despacho_id: despachoId.toString() 
      // filtros: [{ propiedad: 'despacho_id', valor1: despachoId.toString() }],
      // limite: 25,
      // desplazar: 0,
      // ordenamientos: ['-fecha'],
      // limite_conteo: 25,
      // modelo: 'RutUbicacion',
    };

    return this._generalApiService
      .consultaApi<RespuestaApi<Ubicacion>>('ruteo/ubicacion/',parametrosConsultaUbicacion)
      .pipe(takeUntil(this.destroy$));
  }

  recargarDespachos() {
    this.actualizandoLista.set(true);
    this._despachoApiService
      .lista(this.arrParametrosConsulta)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.actualizandoLista.set(false);
        })
      )
      .subscribe((respuesta) => {
        this.arrDespachos = respuesta.results;
        this.alerta.mensajaExitoso('Lista actualizada.', 'Operación exitosa');
        this.changeDetectorRef.detectChanges();
      });
  }

  descargarPlanoSemantica(id: number) {
    this._generalService.descargarArchivo('ruteo/despacho/plano-semantica/', {
      id,
    });
  }

  confirmarTerminarDespacho(id: number) {
    this.alerta
      .confirmar({
        titulo: '¿Estas seguro?',
        texto: 'Esta operación no se puede revertir',
        textoBotonCofirmacion: 'Si, terminar',
      })
      .then((respuesta) => {
        if (respuesta.isConfirmed) {
          this.terminarDespacho(id);
        }
      });
  }

  regenerarIndicadorEntregas(id: number) {
    this._despachoApiService
      .regenerarIndicadorEntregas(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (respuesta) => {
          this.alerta.mensajaExitoso(respuesta.mensaje);
          this.consultarLista();
          this.limpiarInformacionAdicional();
        },
      });
  }

  terminarDespacho(id: number) {
    this._despachoApiService
      .terminar(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (respuesta) => {
          this.alerta.mensajaExitoso(respuesta.mensaje);
          this.consultarLista();
          this.limpiarInformacionAdicional();
        },
      });
  }

  abrirModalDetalleVisita(despacho_id: number) {
    this.selectedDespachoId = despacho_id;
    this.openModal('trafico-despacho-visita');
    this.changeDetectorRef.detectChanges();
  }

  abrirModal(despacho_id: number) {
    this.despachoIdActual = despacho_id;
    this.consultarVisitas(despacho_id).subscribe((respuesta) => {
      this.arrVisitasPorDespacho = respuesta.results;
      if (this.arrVisitasPorDespacho.length > 0) {
        this.mostrarMapa(this.arrVisitasPorDespacho, true, false);
      }
      this.toggleModalRuta$.next(true);
      this.changeDetectorRef.detectChanges();
    });
  }

  abrirModalLiberar(despacho_id) {
    this.despachoIdActual = despacho_id;
    this.toggleModalLiberar$.next(true);
    this.changeDetectorRef.detectChanges();
  }

  abrirModalAdicionar(despacho_id) {
    this.despachoIdActual = despacho_id;
    this.toggleModalAdicionarVisita$.next(true);
    this.changeDetectorRef.detectChanges();
  }

  abrirModalAdicionarVistaTrafico(despacho_id) {
    this.despachoIdActual = despacho_id;
    this.toggleModalAdicionarVisitaTrafico$.next(true);
    this.changeDetectorRef.detectChanges();
  }

  abrirModalUbicacion() {
    this.mostrarMapa(this.arrDespachos, false, true);
    this.toggleModalUbicacion$.next(true);
    this.changeDetectorRef.detectChanges();
  }

  cerrarModal() {
    this.toggleModal$.next(false);
    this.limpiarInformacionAdicional();
  }

  cerrarModalRuta() {
    this.toggleModalRuta$.next(false);
    this.limpiarInformacionAdicional();
  }

  cerrarModalLiberar() {
    this.toggleModalLiberar$.next(false);
    this.limpiarInformacionAdicional();
    this.consultarLista();
  }

  cerrarModalAdicionar() {
    this.toggleModalAdicionarVisita$.next(false);
    this.limpiarInformacionAdicional();
    this.consultarLista();
  }

  cerrarModalAdicionarVisitaTrafico() {
    this.toggleModalAdicionarVisitaTrafico$.next(false);
    this.limpiarInformacionAdicional();
    this.consultarLista();
  }

  obtenerColorBarra(
    estado: string,
    entregadas: number,
    totales: number
  ): string {
    if (estado === 'tiempo') return 'bg-green-500';
    return estado === 'retrazado' || entregadas === 0
      ? 'bg-red-500'
      : 'bg-green-500';
  }

  obtenerAnchoProgreso(
    entregadas: number,
    totales: number
  ): string {
    if (totales === 0) return '0%';
    return `${Math.min((entregadas / totales) * 100, 100)}%`;
  }

  obtenerPorcentajeVisual(entregadas: number, totales: number): string {
    if (totales === 0) return '0';
    const porcentaje = (entregadas / totales) * 100;
    return Math.round(porcentaje).toString();
  }

  openInfoWindow(marker: MapMarker, index: number) {
    this.novedades.set([]);
    this.visitaSeleccionada = this.arrVisitasPorDespacho[index];
    this._consultarNovedadesPorId(this.visitaSeleccionada.id);
    this.infoWindow.open(marker);
  }

  private _consultarNovedadesPorId(id: number) {
    const parametros = {
      filtros: [{ propiedad: 'visita_id', valor1: id.toString() }],
      limite: 50,
      desplazar: 0,
      ordenamientos: ['fecha'],
      limite_conteo: 50,
      modelo: 'RutNovedad',
    };
    this.novedadService.lista(parametros).subscribe({
      next: (respuesta) => {
        this.novedades.set(
          respuesta.results.map((novedad) => novedad.novedad_tipo__nombre)
        );
      },
      error: (error) => {
        console.error('Error al cargar visitas:', error);
      },
    });
  }

  openInfoWindowUbicacion(marker: MapMarker, index: number) {
    this.despachoSeleccionado = this.arrDespachos[index];
    this.infoWindow.open(marker);
  }

  mostrarMapa(arrRegistros, calcular_ruta, index_personalizado) {
    this.customMarkers = [];
    this.marcarPosicionesVisitasOrdenadas = [
      { lat: 6.200713725811437, lng: -75.58609508555918 },
    ];

    arrRegistros.forEach((registro, index) => {
      if (registro.latitud && registro.longitud) {
        const position = { lat: registro.latitud, lng: registro.longitud };
        let label;

        if (!index_personalizado) {
          label = (index + 1).toString();
        } else {
          label = registro.vehiculo_placa;
        }

        this.marcarPosicionesVisitasOrdenadas.push(position);
        this.addMarker(position, label, registro);
      }
    });

    if (this.marcarPosicionesVisitasOrdenadas.length >= 2 && calcular_ruta) {
      // this.calcularRuta();
    }

    this.mostrarMapaFlag = true;
    this.changeDetectorRef.detectChanges();
  }

  // En trafico no se muestra la ruta solo todos los puntos de entrega
  // calcularRuta() {
  //   const origin = this.marcarPosicionesVisitasOrdenadas[0];
  //   const destination =
  //     this.marcarPosicionesVisitasOrdenadas[
  //       this.marcarPosicionesVisitasOrdenadas.length - 1
  //     ];
  //   const waypoints = this.marcarPosicionesVisitasOrdenadas
  //     .slice(1, -1)
  //     .map((position) => ({
  //       location: new google.maps.LatLng(position.lat, position.lng),
  //       stopover: true,
  //     }));

  //   const request: google.maps.DirectionsRequest = {
  //     origin: new google.maps.LatLng(origin.lat, origin.lng),
  //     destination: new google.maps.LatLng(destination.lat, destination.lng),
  //     waypoints,
  //     travelMode: google.maps.TravelMode.DRIVING,
  //     optimizeWaypoints: false,
  //   };

  //   this.directionsService
  //     .route(request)
  //     .pipe(takeUntil(this.destroy$))
  //     .subscribe({
  //       next: (response) => {
  //         this.directionsResultsVisitas = response.result;
  //         this.changeDetectorRef.detectChanges();
  //       },
  //       error: (e) => {
  //         console.error('Error al calcular la ruta:', e);
  //         this.changeDetectorRef.detectChanges();
  //       },
  //     });
  // }

  calcularRutaUbicaciones() {
    this.directionsResultsUbicacionesArray = [];
    this.lineasConectoras = [];

    this.customUbicacionMarkers = [...this.marcarPosicionesUbicacionesOrdenadas]
      .reverse()
      .map((pos, index) => ({
        position: pos,
        label: (index + 1).toString(),
      }));

    if (this.customUbicacionMarkers.length > 0) {
      const primerMarcador = this.customUbicacionMarkers[0];
      this.map.panTo(primerMarcador.position);
      this.map.setZoom(24);
    }

    this.changeDetectorRef.detectChanges();
  }

  addMarker(
    position: { lat: number; lng: number },
    label: string,
    registroData: any
  ) {
    this.customMarkers.push({
      position,
      label: {
        text: label,
        color: 'white',
        fontWeight: 'bold',
        fontSize: '14px',
      },
      title: `Marker ${label}`,
      infoContent: {
        titulo: `Visita #${label}`,
        datosVisita: registroData,
      },
    });
  }

  onModalOpened() {
    setTimeout(() => {
      if (this.map) {
        google.maps.event.trigger(this.map, 'resize');
        this.map.setCenter(this.center);
      }
    }, 300);
  }

  onMapReady(map: google.maps.Map) {
    this.map = map;
  }

  obtenerUbicaciones(despacho_id: number) {
    if (this.arrUbicaciones.length > 0) return;

    this.consultarUbicacion(despacho_id).subscribe((respuesta) => {
      this.arrUbicaciones = respuesta.results;
      this.marcarPosicionesUbicacionesOrdenadas = [
        ...this.arrUbicaciones.map((ubicacion) => ({
          lat: parseFloat(ubicacion.latitud),
          lng: parseFloat(ubicacion.longitud),
        })),
      ];

      if (this.mostrarUbicaciones) {
        this.calcularRutaUbicaciones();
      }
      this.changeDetectorRef.detectChanges();
    });
  }

  toggleUbicaciones(despacho_id: number) {
    this.mostrarUbicaciones = !this.mostrarUbicaciones;

    if (this.mostrarUbicaciones) {
      this.obtenerUbicaciones(despacho_id);
    } else {
      // Limpiar solo lo relacionado a ubicaciones
      this.directionsResultsUbicaciones = null;
      this.arrUbicaciones = [];
      this.marcarPosicionesUbicacionesOrdenadas = [];
      this.customUbicacionMarkers = [];
      this.mostrarUbicaciones = false;
      this.changeDetectorRef.detectChanges();
    }
  }

  confirmarAnularDespacho(id: number) {
    this.alerta
      .confirmar({
        titulo: '¿Estas seguro?',
        texto: 'Esta operación no se puede revertir',
        textoBotonCofirmacion: 'Si, anular',
      })
      .then((respuesta) => {
        if (respuesta.isConfirmed) {
          this.anular(id);
        }
      });
  }

  anular(id: number) {
    this._despachoApiService
      .anular(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (respuesta) => {
          this.alerta.mensajaExitoso(respuesta.mensaje);
          this.consultarLista();
          this.limpiarInformacionAdicional();
        },
      });
  }

  abrirModalEditarDespacho(id: number) {
    this.despachoSeleccionado = this.arrDespachos[id];
    this.toggleModal$.next(true);
    this.changeDetectorRef.detectChanges();
  }

  actualizarDespacho(despacho: DespachoDetalle) {
    this._despachoApiService
      .actualizar(this.despachoSeleccionado.id, despacho)
      .subscribe((respuesta) => {
        this.alerta.mensajaExitoso(
          'Se ha actualizado el despacho exitosamente.'
        );
        this.dismissModal('#editar-despacho');
        this.consultarLista();
      });
  }

  dismissModal(selector: string) {
    const modalEl: HTMLElement = document.querySelector(selector);
    const modal = KTModal.getInstance(modalEl);

    modal.toggle();
  }

  getMarkerIcon(color: string) {
    return {
      url: `data:image/svg+xml;base64,${btoa(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>
      `)}`,
      scaledSize: new google.maps.Size(30, 30), // Ajusta el tamaño
    };
  }

  closeModal(id: string) {
    this._modalService.close(id);
  }

  openModal(id: string) {
    this._modalService.open(id);
  }

  getModalInstaceState(id: string): Observable<boolean> {
    return this._modalService.isOpen$(id);
  }

  abrirModalTrasbordar(id) {
    this.despachoIdActual = id;
    this.toggleModalTrasbordarTrafico$.next(true);
  }

  cerrarModalTrasbordar(selector: string) {
    this.toggleModalTrasbordarTrafico$.next(false);
    this.dismissModal(selector);
    this.consultarLista();
  }
}
