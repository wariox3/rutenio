import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  GoogleMapsModule,
  MapDirectionsService,
  MapInfoWindow,
  MapMarker,
} from '@angular/google-maps';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { General } from '../../../../common/clases/general';
import { ModalDefaultComponent } from '../../../../common/components/ui/modals/modal-default/modal-default.component';
import { FormatFechaPipe } from '../../../../common/pipes/formatear_fecha';
import { RedondearPipe } from '../../../../common/pipes/redondear.pipe';
import { GeneralService } from '../../../../common/services/general.service';
import {
  Despacho,
  DespachoDetalle,
} from '../../../../interfaces/despacho/despacho.interface';
import { ParametrosConsulta } from '../../../../interfaces/general/api.interface';
import { Visita } from '../../../../interfaces/visita/visita.interface';
import DespachoFormularioComponent from '../../../despacho/componentes/despacho-formulario/despacho-formulario.component';
import { DespachoTabUbicacionComponent } from '../../../despacho/componentes/despacho-tab-ubicacion/despacho-tab-ubicacion.component';
import { DespachoTabVisitaComponent } from '../../../despacho/componentes/despacho-tab-visita/despacho-tab-visita.component';
import { DespachoService } from '../../../despacho/servicios/despacho.service';
import { UbicacionService } from '../../../ubicacion/servicios/ubicacion.service';
import { VisitaLiberarComponent } from '../../../visita/componentes/visita-liberar/visita-liberar.component';
import { VisitaService } from '../../../visita/servicios/visita.service';
import { KTModal } from '../../../../../metronic/core';
import { VisitaAdicionarComponent } from "../../../despacho/componentes/despacho-adicionar-visita/despacho-adicionar-visita.component";
import { VisitaAdicionarTraficoComponent } from "../../../despacho/componentes/despacho-adicionar-visita-trafico/despacho-adicionar-visita-trafico.component";

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
    VisitaAdicionarComponent,
    VisitaAdicionarTraficoComponent
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
  private despachoService = inject(DespachoService);
  private _generalService = inject(GeneralService);
  private directionsService = inject(MapDirectionsService);
  private visitaService = inject(VisitaService);
  private ubicacionService = inject(UbicacionService);
  private destroy$ = new Subject<void>();

  public visitaSeleccionada: Visita;
  public despachoSeleccionado: Despacho;
  public mostarModalDetalleVisita$ = new BehaviorSubject<boolean>(false);
  public toggleModal$ = new BehaviorSubject(false);
  public toggleModalAdicionarVisita$ = new BehaviorSubject(false);
  public toggleModalAdicionarVisitaTrafico$ = new BehaviorSubject(false);
  public toggleModalLiberar$ = new BehaviorSubject(false);
  public toggleModalUbicacion$ = new BehaviorSubject(false);

  customMarkers: any[] = [];
  directionsRendererOptions = { suppressMarkers: true };
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
  directionsResults: google.maps.DirectionsResult | undefined;

  arrParametrosConsulta: ParametrosConsulta = {
    filtros: [
      { propiedad: 'estado_aprobado', valor1: true },
      { propiedad: 'estado_terminado', valor1: false },
      { propiedad: 'estado_anulado', valor1: false },
    ],
    limite: 50,
    desplazar: 0,
    ordenamientos: ['id'],
    limite_conteo: 10000,
    modelo: 'RutDespacho',
    serializador: 'Trafico',
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
    this.directionsResults = undefined;
    this.directionsResultsVisitas = undefined;
    this.directionsResultsUbicaciones = undefined;
    this.changeDetectorRef.detectChanges();
  }

  consultarLista() {
    this.despachoService
      .lista(this.arrParametrosConsulta)
      .pipe(takeUntil(this.destroy$))
      .subscribe((respuesta) => {
        this.arrDespachos = respuesta.registros;
        this.changeDetectorRef.detectChanges();
      });
  }

  private consultarVisitas(despachoId: number) {
    const parametrosConsultaVisitas: ParametrosConsulta = {
      filtros: [{ propiedad: 'despacho_id', valor1: despachoId.toString() }],
      limite: 50,
      desplazar: 0,
      ordenamientos: ['orden'],
      limite_conteo: 10000,
      modelo: 'RutVisita',
    };

    return this.visitaService
      .generalLista(parametrosConsultaVisitas)
      .pipe(takeUntil(this.destroy$));
  }

  private consultarUbicacion(despachoId: number) {
    const parametrosConsultaUbicacion: ParametrosConsulta = {
      filtros: [{ propiedad: 'despacho_id', valor1: despachoId.toString() }],
      limite: 25,
      desplazar: 0,
      ordenamientos: ['-fecha'],
      limite_conteo: 25,
      modelo: 'RutUbicacion',
    };

    return this.ubicacionService
      .generalLista(parametrosConsultaUbicacion)
      .pipe(takeUntil(this.destroy$));
  }

  recargarDespachos() {
    this.consultarLista();
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

  terminarDespacho(id: number) {
    this.despachoService
      .terminarDespacho(id)
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
    this.mostarModalDetalleVisita$.next(true);
    this.changeDetectorRef.detectChanges();
  }

  cerrarModalDetalleVisita() {
    this.mostarModalDetalleVisita$.next(false);
    this.selectedDespachoId = null;
  }

  abrirModal(despacho_id: number) {
    this.despachoIdActual = despacho_id;
    this.consultarVisitas(despacho_id).subscribe((respuesta) => {
      this.arrVisitasPorDespacho = respuesta.registros;
      if (this.arrVisitasPorDespacho.length > 0) {
        this.mostrarMapa(this.arrVisitasPorDespacho, true, false);
      }
      this.toggleModal$.next(true);
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
    if (estado === 'tiempo') {
      return 'bg-green-500';
    }
    return estado === 'retrazado' || entregadas === 0
      ? 'bg-red-500'
      : 'bg-green-500';
  }

  obtenerAnchoProgreso(
    estado: string,
    entregadas: number,
    totales: number
  ): string {
    if (totales === 0) return '0%';
    return `${Math.min((entregadas / totales) * 100, 100)}%`;
  }

  obtenerPorcentajeVisual(entregadas: number, totales: number): string {
    return totales === 0 ? '0' : ((entregadas / totales) * 100).toFixed(0);
  }

  openInfoWindow(marker: MapMarker, index: number) {
    this.visitaSeleccionada = this.arrVisitasPorDespacho[index];
    this.infoWindow.open(marker);
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
      this.calcularRuta();
    }

    this.mostrarMapaFlag = true;
    this.changeDetectorRef.detectChanges();
  }

  calcularRuta() {
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
      waypoints,
      travelMode: google.maps.TravelMode.DRIVING,
      optimizeWaypoints: false,
    };

    this.directionsService
      .route(request)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.directionsResultsVisitas = response.result;
          this.changeDetectorRef.detectChanges();
        },
        error: (e) => {
          console.error('Error al calcular la ruta:', e);
          this.changeDetectorRef.detectChanges();
        },
      });
  }

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
        color: '#000000',
        fontWeight: 'bold',
        fontSize: '12px',
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
      this.arrUbicaciones = respuesta.registros;
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
    this.despachoService
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

  abrirModalCrearDespacho() {
    this.toggleModal$.next(true);
    this.changeDetectorRef.detectChanges();
  }

  actualizarDespacho(despacho: DespachoDetalle) {
    this.despachoService
      .actualizar(this.despachoSeleccionado.id, despacho)
      .subscribe((respuesta) => {
        this.alerta.mensajaExitoso(
          'Se ha actualizado el despacho exitosamente.'
        );
        this.dismissModal('#editar-despacho');
        this.consultarLista();
      });
  }

  guardarDespacho(despacho: DespachoDetalle) {
    this.despachoService
      .guardar(despacho)
      .subscribe((respuesta) => {
        this.alerta.mensajaExitoso(
          'Se ha actualizado el despacho exitosamente.'
        );
        this.dismissModal('#crear-despacho');
        this.consultarLista();
      });
  }

  dismissModal(selector: string) {
    const modalEl: HTMLElement = document.querySelector(selector);
    const modal = KTModal.getInstance(modalEl);

    modal.toggle();
  }
}
