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
import { General } from '../../../../common/clases/general';
import { DespachoService } from '../../../despacho/servicios/despacho.service';
import { VisitaService } from '../../../visita/servicios/visita.service';
import { Despacho } from '../../../../interfaces/despacho/despacho.interface';
import { Visita } from '../../../../interfaces/visita/visita.interface';
import { PaginacionDefaultComponent } from '../../../../common/components/ui/paginacion/paginacion-default/paginacion-default.component';
import { ParametrosConsulta } from '../../../../interfaces/general/api.interface';

@Component({
  selector: 'app-diseno-ruta-lista',
  standalone: true,
  imports: [CommonModule, GoogleMapsModule, PaginacionDefaultComponent],
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

  public despachoSeleccionado: Despacho;
  public visitaSeleccionada: Visita;

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
    ordenamientos: [],
    limite_conteo: 10000,
    modelo: 'RutDespacho',
  };

  arrDespachos: Despacho[] = [];
  arrVisitasPorDespacho: Visita[] = [];

  ngOnInit(): void {
    this.consultarLista();
  }

  private _limpiarVisitasPorDespacho() {
    this.mostrarMapaFlag = false;
    this.directionsResults = undefined;
    this.marcarPosicionesVisitasOrdenadas = [];
    this.arrVisitasPorDespacho = [];
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
    // const marker = this.markerMap.get(visita.id);
    // if (marker) {
    //   this.infoWindow.open(marker);
    // }
  }

  mostrarMapa() {
    if (this.despachoSeleccionado) {
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
}
