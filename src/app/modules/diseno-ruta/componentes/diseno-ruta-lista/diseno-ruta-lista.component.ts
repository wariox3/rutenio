import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import {
  GoogleMap,
  GoogleMapsModule,
  MapDirectionsService,
  MapInfoWindow,
  MapMarker,
} from '@angular/google-maps';
import { BehaviorSubject, finalize } from 'rxjs';
import { KTModal } from '../../../../../metronic/core';
import { General } from '../../../../common/clases/general';
import { ModalDefaultComponent } from '../../../../common/components/ui/modals/modal-default/modal-default.component';
import { PaginacionDefaultComponent } from '../../../../common/components/ui/paginacion/paginacion-default/paginacion-default.component';
import { RedondearPipe } from '../../../../common/pipes/redondear.pipe';
import { GeneralService } from '../../../../common/services/general.service';
import { GeneralApiService } from '../../../../core';
import {
  Despacho,
  DespachoDetalle,
} from '../../../../interfaces/despacho/despacho.interface';
import { ParametrosConsulta } from '../../../../interfaces/general/api.interface';
import { Visita } from '../../../../interfaces/visita/visita.interface';
import { VisitaAdicionarPendienteComponent } from '../../../despacho/componentes/despacho-adicionar-visita/despacho-adicionar-visita-pendiente.component';
import DespachoFormularioComponent from '../../../despacho/componentes/despacho-formulario/despacho-formulario.component';
import { DespachoTrasbordarComponent } from '../../../despacho/componentes/despacho-trasbordar/despacho-trasbordar.component';
import { DespachoApiService } from '../../../despacho/servicios/despacho-api.service';
import { VisitaAdicionarComponent } from '../../../visita/componentes/visita-adicionar/visita-adicionar.component';
import { VisitaRutearDetalleComponent } from '../../../visita/componentes/visita-rutear/components/visita-detalle/visita-rutear-detalle.component';
import { VisitaApiService } from '../../../visita/servicios/visita-api.service';

@Component({
  selector: 'app-diseno-ruta-lista',
  standalone: true,
  imports: [
    CommonModule,
    GoogleMapsModule,
    GoogleMap,
    PaginacionDefaultComponent,
    ModalDefaultComponent,
    VisitaRutearDetalleComponent,
    DragDropModule,
    RedondearPipe,
    DespachoFormularioComponent,
    DespachoTrasbordarComponent,
    VisitaAdicionarPendienteComponent,
    VisitaAdicionarComponent,
  ],
  templateUrl: './diseno-ruta-lista.component.html',
  styleUrl: './diseno-ruta-lista.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class DisenoRutaListaComponent
  extends General
  implements OnInit
{
  @ViewChild(MapInfoWindow) infoWindow: MapInfoWindow;
  @ViewChild(GoogleMap) map!: GoogleMap;

  private _despachoApiService = inject(DespachoApiService);
  private _visitaApiService = inject(VisitaApiService);
  private _generalApiService = inject(GeneralApiService);
  private directionsService = inject(MapDirectionsService);
  private _generalService = inject(GeneralService);

  public despachoSeleccionado: Despacho;
  public visitaSeleccionada: Visita;
  public despachoSeleccionadoAdicionar: number;
  public toggleModal$ = new BehaviorSubject(false);
  public toggleModalTrasbordar$ = new BehaviorSubject(false);
  public toggleModalAdicionarVisitaPendiente$ = new BehaviorSubject(false);
  private ultimoDespachoSeleccionadoId: number | null = null;
  public rutaOptimizada: any;

  customMarkers: {
    position: any;
    label: any;
  }[] = [];
  directionsRendererOptions = { suppressMarkers: true };
  mostrarMapaFlag: boolean = false;
  center: google.maps.LatLngLiteral = {
    lat: 6.200713725811437,
    lng: -75.58609508555918,
  };
  zoom = 8;
  marcarPosicionesVisitasOrdenadas: google.maps.LatLngLiteral[] = [];
  polylineOptions: google.maps.PolylineOptions = {
    strokeColor: '#FF0000',
    strokeOpacity: 1.0,
    strokeWeight: 3,
  };
  directionsResults: google.maps.DirectionsResult | undefined;
  public totalRegistrosVisitas: number = 0;
  public mostarModalDetalleVisita$: BehaviorSubject<boolean>;
  public mostarModalAdicionarVisita$: BehaviorSubject<boolean>;
  public mostrarModalAdicionarVisitaPendiente$: BehaviorSubject<boolean>;
  public actualizandoLista = signal(false);
  public parametrosConsultaVisitas: ParametrosConsulta = {
    filtros: [],
    limite: 50,
    desplazar: 0,
    ordenamientos: ['orden'],
    limite_conteo: 10000,
    modelo: 'RutVisita',
  };
  arrParametrosConsulta: ParametrosConsulta = {
    filtros: [{ propiedad: 'estado_aprobado', valor1: false }],
    limite: 50,
    desplazar: 0,
    ordenamientos: ['id'],
    limite_conteo: 10000,
    modelo: 'RutDespacho',
  };

  arrDespachos: Despacho[] = [];
  arrVisitasPorDespacho: Visita[] = [];
  connectedLists: string[] = [];

  constructor() {
    super();
  }

  ngOnInit(): void {
    this.consultarLista();
    this.mostarModalDetalleVisita$ = new BehaviorSubject(false);
    this.mostarModalAdicionarVisita$ = new BehaviorSubject(false);
    this.mostrarModalAdicionarVisitaPendiente$ = new BehaviorSubject(false);

    this.obtenerPuntoOrigenYActualizarMapa();
  }

  private _limpiarVisitasPorDespacho() {
    this.mostrarMapaFlag = false;
    this.directionsResults = undefined;
    this.marcarPosicionesVisitasOrdenadas = [];
    this.arrVisitasPorDespacho = [];
    this.customMarkers = [];
    this.totalRegistrosVisitas = 0;
    this.ultimoDespachoSeleccionadoId = null;
    this.changeDetectorRef.detectChanges();
  }

  private _scrollToRow(index: number): void {
    if (window.innerWidth >= 1280) {
      const row = document.getElementById(`fila-${index}`);
      if (row) {
        row.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }

  obtenerPuntoOrigenYActualizarMapa() {
    this._generalService.puntoOrigen().subscribe({
      next: (data) => {
        const origen = data.configuracion?.[0];
        if (origen && origen.rut_latitud && origen.rut_longitud) {
          this.center = {
            lat: origen.rut_latitud,
            lng: origen.rut_longitud,
          };
          this.changeDetectorRef.detectChanges(); // Asegúrate de detectar cambios
        }
      },
      error: (error) => {
        console.error('Error al obtener punto de origen', error);
      },
    });
  }

  consultarLista() {
    this._despachoApiService
      .lista(this.arrParametrosConsulta)
      .subscribe((respuesta) => {
        this.arrDespachos = respuesta.registros;
        this.changeDetectorRef.detectChanges();
      });
  }

  paginar(evento: { limite: number; desplazar: number }) {
    const parametrosConsulta: ParametrosConsulta = {
      ...this.parametrosConsultaVisitas,
      limite: evento.limite,
      desplazar: evento.desplazar,
    };

    this._consultarVisitas(parametrosConsulta);
  }

  seleccionarDespacho(despacho: any) {
    if (this.ultimoDespachoSeleccionadoId === despacho.id) return;

    this.ultimoDespachoSeleccionadoId = despacho.id;
    this.despachoSeleccionado = despacho;
    this.mostrarMapaFlag = false;
    this.marcarPosicionesVisitasOrdenadas = [];
    this.directionsResults = undefined;

    this.customMarkers = [];

    this.parametrosConsultaVisitas.filtros = [
      { propiedad: 'despacho_id', valor1: despacho.id },
    ];

    this._consultarVisitas(this.parametrosConsultaVisitas);
    this.changeDetectorRef.detectChanges();
  }

  private _consultarVisitas(parametrosConsulta: ParametrosConsulta) {
    this.actualizandoLista.set(true);
    this._generalApiService
      .getLista<Visita[]>(parametrosConsulta)
      .pipe(
        finalize(() => {
          this.actualizandoLista.set(false);
        })
      )
      .subscribe((respuesta) => {
        this.arrVisitasPorDespacho = respuesta.registros;
        this.totalRegistrosVisitas = respuesta.cantidad_registros;
        this.initializeConnectedLists();
        this.changeDetectorRef.detectChanges();
        this.mostrarMapa();
      });
  }

  addMarker(position: google.maps.LatLngLiteral) {
    this.marcarPosicionesVisitasOrdenadas.push(position);
  }

  eliminarDespacho(despachoId: number) {
    this._despachoApiService.eliminar(despachoId).subscribe((respuesta) => {
      this.alerta.mensajaExitoso('Despacho eliminado con exito');
      this.consultarLista();
      this._limpiarVisitasPorDespacho();
    });
  }

  openInfoWindow(marker: MapMarker, index: number) {
    if (index >= 0 && index < this.arrVisitasPorDespacho.length) {
      this.visitaSeleccionada = this.arrVisitasPorDespacho[index];
      this._scrollToRow(this.visitaSeleccionada.id);
      this.infoWindow.open(marker);
    }
  }

  evento(visita: any) {
    this.visitaSeleccionada = visita;
    this.center = { lat: visita.latitud, lng: visita.longitud };
    this.changeDetectorRef.detectChanges();
  }

  mostrarMapa() {
    if (this.despachoSeleccionado) {
      this.customMarkers = [];
      this.marcarPosicionesVisitasOrdenadas = [this.center];

      this._despachoApiService
        .obtenerRuta(this.despachoSeleccionado.id)
        .subscribe({
          next: (response) => {
            const path = response.respuesta.puntos_detallados.map((p) => ({
              lat: p[0],
              lng: p[1],
            }));

            this.rutaOptimizada = {
              path: path,
              options: {
                strokeColor: '#00b2ff',
                strokeOpacity: 1.0,
                strokeWeight: 4,
              },
              distancia: response.respuesta.distancia_total,
              duracion: response.respuestaduracion_total,
            };

            // Ajustar vista del mapa
            const bounds = new google.maps.LatLngBounds();
            path.forEach((p) => bounds.extend(p));
            this.map.fitBounds(bounds);

            this._generarMarcadoresPersonalizados(response.respuesta.data);
            this.changeDetectorRef.detectChanges();
          },
          error: (e) => console.error(e),
        });

      this.mostrarMapaFlag = true;
      this.changeDetectorRef.detectChanges();
    } else {
      this.alerta.mensajeError(
        'No se ha seleccionado ningún despacho',
        'Error'
      );
    }
  }

  private _generarMarcadoresPersonalizados(
    result: google.maps.DirectionsResult
  ) {
    const route = result.routes[0];
    const legs = route.legs;

    // Agregar marcador para el punto de inicio
    this.customMarkers.push({
      position: {
        lat: legs[0].start_location.lat,
        lng: legs[0].start_location.lng,
      },

      label: {} as google.maps.MarkerLabel,
    });

    let counter = 1;
    legs.forEach((leg) => {
      this.customMarkers.push({
        position: {
          lat: leg.end_location.lat,
          lng: leg.end_location.lng,
        },
        label: {
          text: counter.toString(),
          color: 'white',
          fontSize: '16px',
          fontWeight: 'bold',
        } as google.maps.MarkerLabel,
      });
      counter++;
    });
  }

  retirarVisita(id: number) {
    this._visitaApiService.retirar(id).subscribe({
      next: (response) => {
        this.alerta.mensajaExitoso(response?.mensaje);
        this.consultarLista();
        this._consultarVisitas(this.parametrosConsultaVisitas);
      },
    });
  }

  confirmarRetirarVisita(id: number) {
    this.alerta
      .confirmar({
        titulo: '¿Estas seguro?',
        texto: 'Esta operación no se puede revertir',
        textoBotonCofirmacion: 'Si, retirar',
        colorConfirmar: '#4287f5',
      })
      .then((respuesta) => {
        if (respuesta.isConfirmed) {
          this.retirarVisita(id);
        }
      });
  }

  eliminarVisita(id: number) {
    this._visitaApiService.eliminarPorId(id).subscribe({
      next: (response) => {
        this.alerta.mensajaExitoso('Visita eliminada exitosamente');
        this.consultarLista();
        this._consultarVisitas(this.parametrosConsultaVisitas);
      },
    });
  }

  aprobarDespacho(id: number) {
    this._despachoApiService.aprobar(id).subscribe((respuesta) => {
      this.alerta.mensajaExitoso('Despacho aprobado con exito');
      this.consultarLista();
      this._limpiarVisitasPorDespacho();
    });
  }

  confirmarAprobarDespacho(id: number) {
    this.alerta
      .confirmar({
        titulo: '¿Estas seguro?',
        texto: 'Esta operación no se puede revertir',
        textoBotonCofirmacion: 'Si, aprobar',
      })
      .then((respuesta) => {
        if (respuesta.isConfirmed) {
          this.aprobarDespacho(id);
        }
      });
  }

  private initializeConnectedLists(): void {
    this.connectedLists = this.arrDespachos.map((_, index) => `listB-${index}`);
  }

  onDropToB(event: CdkDragDrop<any[]>, index: number) {
    if (event.previousContainer.id !== event.container.id) {
      const draggedItem = event.previousContainer.data[event.previousIndex];
      const despacho = this.arrDespachos.find((_, i) => i === index);
      const pesoActualizado = despacho?.peso + draggedItem?.peso;

      if (pesoActualizado > despacho.vehiculo_capacidad) {
        this.alerta.mensajeError(
          'La operación no es posible',
          `El vehiculo tiene una capacidad maxima de ${despacho.vehiculo_capacidad} kg`
        );
        return null;
      }

      if (draggedItem.despacho_id === despacho.id) {
        this.alerta.mensajeError(
          'La visita no se pudo mover',
          'Actualmente pertenece al despacho'
        );
        throw new Error('La visita actualmente pertenece al mismo depacho');
      }

      this.arrVisitasPorDespacho.splice(event.previousIndex, 1);

      this._visitaApiService
        .cambiarDespacho(draggedItem.id, despacho.id)
        .subscribe({
          next: (response) => {
            this.consultarLista();
            this._consultarVisitas(this.parametrosConsultaVisitas);
            this.alerta.mensajaExitoso(response.mensaje);
          },
        });
    }
  }

  descargarPlanoSemantica(id: number) {
    this._generalService.descargarArchivo('ruteo/despacho/plano-semantica/', {
      id,
    });
  }

  cerrarModalDetalleVisita() {
    this.mostarModalDetalleVisita$.next(true);
  }

  abrirModalDetalleVisita() {
    this.mostarModalDetalleVisita$.next(true);
  }

  cerrarModalAdicionarVisita() {
    this.mostarModalAdicionarVisita$.next(true);
    this.consultarLista();
    this.recargarDespachos();
  }

  abrirModalAdicionarVisita(id: number) {
    this.despachoSeleccionadoAdicionar = id;
    this.mostarModalAdicionarVisita$.next(true);
  }

  abrirModalCrearDespacho() {
    this.toggleModal$.next(true);
    this.changeDetectorRef.detectChanges();
  }

  abrirModalAdicionarVisitaPendiente(id: number) {
    this.despachoSeleccionadoAdicionar = id;
    this.mostrarModalAdicionarVisitaPendiente$.next(true);
  }

  cerrarModalAdicionarVisitaPendiente() {
    this.mostrarModalAdicionarVisitaPendiente$.next(false);
  }

  guardarDespacho(despacho: DespachoDetalle) {
    this._despachoApiService.guardar(despacho).subscribe((respuesta) => {
      this.alerta.mensajaExitoso('Se ha guardado el despacho exitosamente.');
      this.dismissModal('#crear-despacho');
      this.consultarLista();
    });
  }

  dismissModal(selector: string) {
    const modalEl: HTMLElement = document.querySelector(selector);
    const modal = KTModal.getInstance(modalEl);

    modal.toggle();
  }

  cerrarModalAdicionar() {
    this.toggleModal$.next(true);
  }

  cerrarModalTrasbordar(selector: string) {
    this.toggleModalTrasbordar$.next(false);
    this.dismissModal(selector);
    this.consultarLista();
    this._limpiarVisitasPorDespacho();
  }

  abrirModalTrasbordar(id) {
    this.despachoSeleccionadoAdicionar = id;
    this.toggleModalTrasbordar$.next(true);
  }

  recargarDespachos() {
    this._consultarVisitas(this.parametrosConsultaVisitas);
  }
}
