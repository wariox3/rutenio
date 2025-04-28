import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  GoogleMapsModule,
  MapDirectionsService,
  MapInfoWindow,
  MapMarker,
} from '@angular/google-maps';
import { BehaviorSubject } from 'rxjs';
import { General } from '../../../../common/clases/general';
import { ModalDefaultComponent } from '../../../../common/components/ui/modals/modal-default/modal-default.component';
import { PaginacionDefaultComponent } from '../../../../common/components/ui/paginacion/paginacion-default/paginacion-default.component';
import {
  Despacho,
  DespachoDetalle,
} from '../../../../interfaces/despacho/despacho.interface';
import { ParametrosConsulta } from '../../../../interfaces/general/api.interface';
import { Visita } from '../../../../interfaces/visita/visita.interface';
import { DespachoService } from '../../../despacho/servicios/despacho.service';
import { VisitaRutearDetalleComponent } from '../../../visita/componentes/visita-rutear/components/visita-detalle/visita-rutear-detalle.component';
import { VisitaService } from '../../../visita/servicios/visita.service';
import { GeneralService } from '../../../../common/services/general.service';
import { RedondearPipe } from '../../../../common/pipes/redondear.pipe';
import { VisitaAdicionarComponent } from '../../../despacho/componentes/despacho-adicionar-visita/despacho-adicionar-visita.component';
import DespachoFormularioComponent from '../../../despacho/componentes/despacho-formulario/despacho-formulario.component';
import { KTModal } from '../../../../../metronic/core';

@Component({
  selector: 'app-diseno-ruta-lista',
  standalone: true,
  imports: [
    CommonModule,
    GoogleMapsModule,
    PaginacionDefaultComponent,
    ModalDefaultComponent,
    VisitaRutearDetalleComponent,
    DragDropModule,
    RedondearPipe,
    VisitaAdicionarComponent,
    DespachoFormularioComponent,
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

  private despachoService = inject(DespachoService);
  private visitaService = inject(VisitaService);
  private directionsService = inject(MapDirectionsService);
  private _generalService = inject(GeneralService);

  public despachoSeleccionado: Despacho;
  public visitaSeleccionada: Visita;
  public despachoSeleccionadoAdicionar: number;
  public toggleModal$ = new BehaviorSubject(false);

  customMarkers: {
    position: google.maps.LatLngLiteral;
    label: google.maps.MarkerLabel;
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
  }

  private _limpiarVisitasPorDespacho() {
    this.mostrarMapaFlag = false;
    this.directionsResults = undefined;
    this.marcarPosicionesVisitasOrdenadas = [];
    this.arrVisitasPorDespacho = [];
    this.customMarkers = [];
    this.totalRegistrosVisitas = 0;
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

  consultarLista() {
    this.despachoService
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
    this.despachoSeleccionado = despacho;
    this.mostrarMapaFlag = false;
    this.marcarPosicionesVisitasOrdenadas = [];
    this.directionsResults = undefined;
    this.changeDetectorRef.detectChanges();

    this.parametrosConsultaVisitas.filtros = [
      {
        propiedad: 'despacho_id',
        valor1: despacho.id,
      },
    ];

    this._consultarVisitas(this.parametrosConsultaVisitas);
  }

  private _consultarVisitas(parametrosConsulta: ParametrosConsulta) {
    this.visitaService
      .generalLista(parametrosConsulta)
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
    this.despachoService.eliminarDespacho(despachoId).subscribe((respuesta) => {
      this.alerta.mensajaExitoso('Despacho eliminado con exito');
      this.consultarLista();
      this._limpiarVisitasPorDespacho();
    });
  }

  openInfoWindow(marker: MapMarker, index: number) {
    this.visitaSeleccionada = this.arrVisitasPorDespacho[index];
    this._scrollToRow(this.visitaSeleccionada.id);
    this.infoWindow.open(marker);
  }

  evento(visita: any) {
    this.visitaSeleccionada = visita;
    this.center = { lat: visita.latitud, lng: visita.longitud };
    this.changeDetectorRef.detectChanges();
  }

  mostrarMapa() {
    if (this.despachoSeleccionado) {
      this.customMarkers = [];
      this.marcarPosicionesVisitasOrdenadas = [
        { lat: 6.200713725811437, lng: -75.58609508555918 },
      ];
      this.arrVisitasPorDespacho.forEach((punto) => {
        this.addMarker({ lat: punto.latitud, lng: punto.longitud });
      });

      if (this.marcarPosicionesVisitasOrdenadas.length < 2) {
        console.error(
          'Se necesitan al menos dos puntos para calcular la ruta.'
        );
        this.changeDetectorRef.detectChanges();
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
        optimizeWaypoints: false,
      };

      this.directionsService.route(request).subscribe({
        next: (response) => {
          this.directionsResults = response.result;

          // Generar los marcadores personalizados
          this._generarMarcadoresPersonalizados(response.result);
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
        lat: legs[0].start_location.lat(),
        lng: legs[0].start_location.lng(),
      },

      label: {} as google.maps.MarkerLabel,
    });

    // Agregar marcadores para los puntos intermedios (waypoints)
    let counter = 1;
    legs.forEach((leg) => {
      this.customMarkers.push({
        position: {
          lat: leg.end_location.lat(),
          lng: leg.end_location.lng(),
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
    this.visitaService.retirarVisita(id).subscribe({
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

  confirmarEliminarVisita(id: number) {
    this.alerta
      .confirmar({
        titulo: '¿Estas seguro?',
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
    this.visitaService.eliminarVisita(id).subscribe({
      next: (response) => {
        this.alerta.mensajaExitoso('Visita eliminada exitosamente');
        this.consultarLista();
        this._consultarVisitas(this.parametrosConsultaVisitas);
      },
    });
  }

  aprobarDespacho(id: number) {
    this.despachoService.aprobar(id).subscribe((respuesta) => {
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

  cerrarModalDetalleVisita() {
    this.mostarModalDetalleVisita$.next(true);
  }

  abrirModalDetalleVisita() {
    this.mostarModalDetalleVisita$.next(true);
  }

  cerrarModalAdicionarVisita() {
    this.mostarModalAdicionarVisita$.next(true);
    this.consultarLista();
  }

  abrirModalAdicionarVisita(id) {
    this.despachoSeleccionadoAdicionar = id;
    this.mostarModalAdicionarVisita$.next(true);
  }

  onDropToB(event: CdkDragDrop<any[]>, index: number) {
    if (event.previousContainer.id !== event.container.id) {
      const draggedItem = event.previousContainer.data[event.previousIndex];
      const despacho = this.arrDespachos.find((_, i) => i === index);

      if (draggedItem.despacho_id === despacho.id) {
        this.alerta.mensajeError(
          'La visita no se pudo mover',
          'Actualmente pertenece al despacho'
        );
        throw new Error('La visita actualmente pertenece al mismo depacho');
      }

      this.arrVisitasPorDespacho.splice(event.previousIndex, 1);

      this.visitaService
        .cambiarDespachoVisita(draggedItem.id, despacho.id)
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

  abrirModalCrearDespacho() {
    this.toggleModal$.next(true);
    this.changeDetectorRef.detectChanges();
  }

  guardarDespacho(despacho: DespachoDetalle) {
    this.despachoService.guardar(despacho).subscribe((respuesta) => {
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

  cerrarModalAdicionar(){
    this.toggleModal$.next(true);
    this.consultarLista();
  }
    
}
