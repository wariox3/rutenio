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
  MapInfoWindow,
  MapMarker
} from '@angular/google-maps';
import { BehaviorSubject, finalize, Observable } from 'rxjs';
import { KTModal } from '../../../../../metronic/core';
import { General } from '../../../../common/clases/general';
import { ModalDefaultComponent } from '../../../../common/components/ui/modals/modal-default/modal-default.component';
import { ModalStandardComponent } from '../../../../common/components/ui/modals/modal-standard/modal-standard.component';
import { ModalService } from '../../../../common/components/ui/modals/service/modal.service';
import { RedondearPipe } from '../../../../common/pipes/redondear.pipe';
import { GeneralService } from '../../../../common/services/general.service';
import { GeneralApiService } from '../../../../core';
import { ParametrosApi, RespuestaApi } from '../../../../core/types/api.type';
import {
  Despacho,
  DespachoDetalle,
} from '../../../../interfaces/despacho/despacho.interface';
import { Visita } from '../../../../interfaces/visita/visita.interface';
import { VisitaAdicionarPendienteComponent } from '../../../despacho/componentes/despacho-adicionar-visita/despacho-adicionar-visita-pendiente.component';
import DespachoFormularioComponent from '../../../despacho/componentes/despacho-formulario/despacho-formulario.component';
import { DespachoTrasbordarComponent } from '../../../despacho/componentes/despacho-trasbordar/despacho-trasbordar.component';
import { DespachoApiService } from '../../../despacho/servicios/despacho-api.service';
import { VisitaAdicionarComponent } from '../../../visita/componentes/visita-adicionar/visita-adicionar.component';
import { VisitaRutearDetalleComponent } from '../../../visita/componentes/visita-rutear/components/visita-detalle/visita-rutear-detalle.component';
import { VisitaApiService } from '../../../visita/servicios/visita-api.service';
import { NuevoDesdeComplementoComponent } from '../nuevo-desde-complemento/nuevo-desde-complemento.component';
import { PaginadorComponent } from "../../../../common/components/ui/paginacion/paginador/paginador.component";
import { HttpService } from '../../../../common/services/http.service';

@Component({
  selector: 'app-diseno-ruta-lista',
  standalone: true,
  imports: [
    CommonModule,
    GoogleMapsModule,
    GoogleMap,
    ModalDefaultComponent,
    VisitaRutearDetalleComponent,
    DragDropModule,
    RedondearPipe,
    DespachoFormularioComponent,
    DespachoTrasbordarComponent,
    VisitaAdicionarPendienteComponent,
    VisitaAdicionarComponent,
    ModalStandardComponent,
    NuevoDesdeComplementoComponent,
    PaginadorComponent
  ],
  templateUrl: './diseno-ruta-lista.component.html',
  styleUrl: './diseno-ruta-lista.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class DisenoRutaListaComponent
  extends General
  implements OnInit {
  @ViewChild(MapInfoWindow) infoWindow: MapInfoWindow;
  @ViewChild(GoogleMap) map!: GoogleMap;

  private _despachoApiService = inject(DespachoApiService);
  private _visitaApiService = inject(VisitaApiService);
  private _generalApiService = inject(GeneralApiService);
  private _generalService = inject(GeneralService);
  private _httpService = inject(HttpService);
  private _modalService = inject(ModalService);
  private ultimoDespachoSeleccionadoId: number | null = null;

  public despachoSeleccionado: Despacho;
  public visitaSeleccionada: Visita;
  public despachoSeleccionadoAdicionar: number;
  public toggleModal$ = new BehaviorSubject(false);
  public toggleModalTrasbordar$ = new BehaviorSubject(false);
  public toggleModalAdicionarVisitaPendiente$ = new BehaviorSubject(false);
  public rutaOptimizada: any;
  public tramosRuta: { path: google.maps.LatLngLiteral[]; options: google.maps.PolylineOptions }[] = [];
  public currentPage = signal(1);
  public totalPages = signal(1);
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
  public parametrosConsultaVisitas: ParametrosApi = {
    limit: 50,
    ordering: 'orden',
  };
  arrParametrosConsulta: ParametrosApi = {
    'estado_aprobado': 'False',
    limit: 50,
    ordering: 'id',
  };
  public cantidadRegistros: number = 0;
  public despachoSeleccionadoId = signal<number>(0);
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
    this.tramosRuta = [];
    this.rutaOptimizada = null;
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
        this.arrDespachos = respuesta.results;
        this.changeDetectorRef.detectChanges();
      });
  }

  seleccionarDespacho(despacho: any) {
    if (this.ultimoDespachoSeleccionadoId === despacho.id) return;

    this.ultimoDespachoSeleccionadoId = despacho.id;
    this.despachoSeleccionado = despacho;
    this.mostrarMapaFlag = false;
    this.marcarPosicionesVisitasOrdenadas = [];
    this.directionsResults = undefined;
    this.tramosRuta = [];
    this.rutaOptimizada = null;
    this.customMarkers = [];
    this.despachoSeleccionadoId.set(despacho.id);
    this.parametrosConsultaVisitas = {
      ...this.parametrosConsultaVisitas,
      'despacho_id': despacho.id
    };

    this._consultarVisitas(this.parametrosConsultaVisitas);
    this.changeDetectorRef.detectChanges();
  }

  private _consultarVisitas(parametrosConsulta: ParametrosApi) {
    this.actualizandoLista.set(true);
    this._generalApiService
      .consultaApi<RespuestaApi<Visita>>('ruteo/visita/', parametrosConsulta)
      .pipe(
        finalize(() => {
          this.actualizandoLista.set(false);
        })
      )
      .subscribe((respuesta) => {
        this.arrVisitasPorDespacho = respuesta.results;
        this.totalRegistrosVisitas = respuesta.count;
        this.initializeConnectedLists();
        this.changeDetectorRef.detectChanges();
        this.mostrarMapa();
      });
  }

  addMarker(position: google.maps.LatLngLiteral) {
    this.marcarPosicionesVisitasOrdenadas.push(position);
  }

  confirmarEliminarDespacho(despachoId: number) {
    this.alerta
      .confirmar({
        titulo: '¿Estás seguro?',
        texto: 'Se retirarán todas las visitas del despacho',
        textoBotonCofirmacion: 'Si, eliminar',
        colorConfirmar: '#dc3545',
      })
      .then((respuesta) => {
        if (respuesta.isConfirmed) {
          this._despachoApiService.eliminar(despachoId).subscribe((resp) => {
            this.alerta.mensajaExitoso('Despacho eliminado con exito');
            this.consultarLista();
            this._limpiarVisitasPorDespacho();
          });
        }
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
              distancia: response.respuesta.distancia,
              duracion: response.respuesta.duracion,
            };

            // Generar tramos coloreados por cita
            const puntosPorTramo = response.respuesta.puntos_por_tramo;
            const tieneCitas = response.respuesta.tiene_citas || [];
            if (puntosPorTramo && puntosPorTramo.length > 0) {
              this.tramosRuta = puntosPorTramo.map(
                (tramo: number[][], index: number) => ({
                  path: tramo.map((p: number[]) => ({ lat: p[0], lng: p[1] })),
                  options: {
                    strokeColor: tieneCitas[index] ? '#8B5CF6' : '#00b2ff',
                    strokeOpacity: 1.0,
                    strokeWeight: 4,
                  },
                })
              );
              this.rutaOptimizada = null;
            } else {
              this.tramosRuta = [];
            }

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

  getMarkerIcon(visitaIndex: number): google.maps.Icon {
    const visita = this.arrVisitasPorDespacho[visitaIndex];
    const url = visita?.cita_inicio
      ? 'assets/images/marker-morado.svg'
      : 'assets/images/marker-azul.svg';
    return {
      url,
      scaledSize: new google.maps.Size(28, 40),
      anchor: new google.maps.Point(14, 40),
      labelOrigin: new google.maps.Point(14, 15),
    };
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
        titulo: '¿Estás seguro?',
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
      this.router.navigate(['/trafico/lista']);
    });
  }

  confirmarAprobarDespacho(id: number) {
    this.alerta
      .confirmar({
        titulo: '¿Estás seguro?',
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
      const despacho = this.arrDespachos[index];

      if (!despacho || !draggedItem) {
        return;
      }

      const pesoActualizado = (despacho.peso || 0) + (draggedItem.peso || 0);

      if (pesoActualizado > despacho.vehiculo__capacidad) {
        this.alerta.mensajeError(
          'La operación no es posible',
          `El vehiculo tiene una capacidad maxima de ${despacho.vehiculo__capacidad} kg`
        );
        return;
      }

      if (draggedItem.despacho_id === despacho.id) {
        this.alerta.mensajeError(
          'La visita no se pudo mover',
          'Actualmente pertenece al despacho'
        );
        return;
      }

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

  reordenarDespacho(despachoId: number) {
    this.actualizandoLista.set(true);
    this._visitaApiService
      .ordenarPorDespacho(despachoId)
      .pipe(finalize(() => this.actualizandoLista.set(false)))
      .subscribe({
        next: () => {
          this.alerta.mensajaExitoso('Visitas reordenadas');
          this._consultarVisitas(this.parametrosConsultaVisitas);
        },
      });
  }

  descargarPlanoSemantica(id: number) {
    this._httpService.descargarArchivo('ruteo/despacho/plano-semantica/', {
      id,
    });
  }

  cerrarModalDetalleVisita() {
    this.mostarModalDetalleVisita$.next(false);
  }

  abrirModalDetalleVisita() {
    this.mostarModalDetalleVisita$.next(true);
  }

  cerrarModalAdicionarVisita() {
    this.mostarModalAdicionarVisita$.next(false);
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
    this.toggleModal$.next(false);
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

  cerrarModal(id: string) {
    this._modalService.close(id);
  }

  complementoCargado() {
    this.cerrarModal('nuevoDesdeComplemento');
    this.consultarLista();
    this._limpiarVisitasPorDespacho();
  }

  abrirModal(id: string) {
    this._modalService.open(id);
  }

  getModalInstaceState(id: string): Observable<boolean> {
    return this._modalService.isOpen$(id);
  }

  onPageChange(page: number): void {

    this.parametrosConsultaVisitas = {
      ...this.parametrosConsultaVisitas,
      'despacho_id': this.despachoSeleccionadoId(),
      page
    };
    this._consultarVisitas(this.parametrosConsultaVisitas);
  }

}
