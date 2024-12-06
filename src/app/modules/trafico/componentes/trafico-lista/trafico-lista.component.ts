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

@Component({
  selector: 'app-trafico-lista',
  standalone: true,
  imports: [CommonModule, GoogleMapsModule],
  templateUrl: './trafico-lista.component.html',
  styleUrl: './trafico-lista.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TraficoListaComponent extends General implements OnInit {
  private despachoService = inject(DespachoService);
  private visitaService = inject(VisitaService);
  private directionsService: MapDirectionsService;

  public visitaSeleccionada: Visita;

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
}
