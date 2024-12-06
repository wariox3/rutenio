import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
} from '@angular/core';
import { GoogleMapsModule, MapDirectionsService } from '@angular/google-maps';
import { General } from '../../../../common/clases/general';
import { DespachoService } from '../../../despacho/servicios/despacho.service';
import { VisitaService } from '../../../visita/servicios/visita.service';
import { ParametrosConsulta } from '../../../../interfaces/general/api.interface';
import { Despacho } from '../../../../interfaces/despacho/despacho.interface';
import { Visita } from '../../../../interfaces/visita/visita.interface';
import { GeneralService } from '../../../../common/services/general.service';
import { BehaviorSubject } from 'rxjs';
import { ModalDefaultComponent } from "../../../../common/components/ui/modals/modal-default/modal-default.component";
import { VisitaRutearDetalleComponent } from "../../../visita/componentes/visita-rutear/components/visita-detalle/visita-rutear-detalle.component";

@Component({
  selector: 'app-trafico-lista',
  standalone: true,
  imports: [CommonModule, GoogleMapsModule, ModalDefaultComponent, VisitaRutearDetalleComponent],
  templateUrl: './trafico-lista.component.html',
  styleUrl: './trafico-lista.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TraficoListaComponent extends General implements OnInit {
  private despachoService = inject(DespachoService);
  private visitaService = inject(VisitaService);
  private directionsService: MapDirectionsService;
  private _generalService = inject(GeneralService);

  public visitaSeleccionada: Visita;
  public mostarModalDetalleVisita$: BehaviorSubject<boolean>;

  despachoSeleccionado: any = null;
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

  arrParametrosConsulta: ParametrosConsulta = {
    filtros: [
      { propiedad: 'estado_aprobado', valor1: true },
      { propiedad: 'estado_terminado', valor1: false },
    ],
    limite: 50,
    desplazar: 0,
    ordenamientos: ['id'],
    limite_conteo: 10000,
    modelo: 'RutDespacho',
  };

  arrDespachos: Despacho[] = [];
  arrVisitasPorDespacho: Visita[] = [];

  constructor() {
    super();
    this.mostarModalDetalleVisita$ = new BehaviorSubject(false);
  }

  ngOnInit(): void {
    this.consultarLista();
  }

  consultarLista() {
    this.despachoService
      .lista(this.arrParametrosConsulta)
      .subscribe((respuesta) => {
        this.arrDespachos = respuesta.registros;
        this.changeDetectorRef.detectChanges();
      });
  }

  seleccionarDespacho(despacho: any) {
    this.despachoSeleccionado = despacho;
    this.mostrarMapaFlag = false;
    this.marcarPosicionesVisitasOrdenadas = [];
    this.directionsResults = undefined;
    this.changeDetectorRef.detectChanges();

    const parametrosConsultaVisitas = {
      filtros: [{ propiedad: 'despacho_id', valor1: despacho.id }],
      limite: 50,
      desplazar: 0,
      ordenamientos: [],
      limite_conteo: 10000,
      modelo: 'RutVisita',
    };
    this.visitaService
      .generalLista(parametrosConsultaVisitas)
      .subscribe((respuesta) => {
        this.arrVisitasPorDespacho = respuesta.registros;
        this.changeDetectorRef.detectChanges();
      });
  }

  addMarker(position: google.maps.LatLngLiteral) {
    this.marcarPosicionesVisitasOrdenadas.push(position);
  }

  mostrarMapa(despachoSeleccionado: number) {
    if (despachoSeleccionado) {
      this.marcarPosicionesVisitasOrdenadas = [
        { lat: 6.200713725811437, lng: -75.58609508555918 },
      ];
      this.arrVisitasPorDespacho.forEach((punto) => {
        this.addMarker({ lat: punto.latitud, lng: punto.longitud });
      });

      if (this.marcarPosicionesVisitasOrdenadas.length < 1) {
        console.error(
          'Se necesitan al menos dos puntos para calcular la ruta.'
        );
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

  evento(visita: any) {
    this.visitaSeleccionada = visita;
    this.center = { lat: visita.latitud, lng: visita.longitud };
    this.changeDetectorRef.detectChanges();
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
    this.despachoService.terminarDespacho(id).subscribe({
      next: (respuesta) => {
        this.alerta.mensajaExitoso(respuesta.mensaje);
        this.consultarLista();
        this._limpiarInformacionAdicional();
      },
    });
  }

  private _limpiarInformacionAdicional() {
    this.arrVisitasPorDespacho = [];
    this.changeDetectorRef.detectChanges();
  }

  abrirModalDetalleVisita() {
    this.mostarModalDetalleVisita$.next(true);
  }

  cerrarModalDetalleVisita() {
    this.mostarModalDetalleVisita$.next(false);
  }
}
