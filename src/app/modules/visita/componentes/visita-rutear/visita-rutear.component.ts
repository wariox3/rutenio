import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { General } from '../../../../common/clases/general';
import { ListaVehiculo } from '../../../../interfaces/vehiculo/vehiculo.interface';
import { Visita } from '../../../../interfaces/visita/visita.interface';
import { ButtonComponent } from '../../../../common/components/ui/button/button.component';
import { forkJoin, tap } from 'rxjs';
import { VehiculoService } from '../../../vehiculo/servicios/vehiculo.service';
import { VisitaService } from '../../servicios/visita.service';
import { ParametrosConsulta } from '../../../../interfaces/general/api.interface';
import {
  GoogleMapsModule,
  MapInfoWindow,
  MapMarker,
} from '@angular/google-maps';

@Component({
  selector: 'app-visita-rutear',
  standalone: true,
  imports: [CommonModule, ButtonComponent, GoogleMapsModule],
  templateUrl: './visita.rutear.component.html',
  styleUrl: './visita-rutear.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class VisitaRutearComponent extends General implements OnInit {
  @ViewChild(MapInfoWindow) infoWindow: MapInfoWindow;

  center: google.maps.LatLngLiteral = {
    lat: 6.200713725811437,
    lng: -75.58609508555918,
  };
  zoom = 11;
  markerPositions: google.maps.LatLngLiteral[] = [];
  polylineOptions: google.maps.PolylineOptions = {
    strokeColor: '#FF0000',
    strokeOpacity: 1.0,
    strokeWeight: 3,
  };
  directionsResults: google.maps.DirectionsResult | undefined;

  arrParametrosConsulta: ParametrosConsulta = {
    filtros: [],
    limite: 50,
    desplazar: 0,
    ordenamientos: [],
    limite_conteo: 10000,
    modelo: 'RutVehiculo',
  };

  arrParametrosConsultaVisita: ParametrosConsulta = {
    filtros: [
      { propiedad: 'estado_despacho', valor1: false },
      { propiedad: 'estado_decodificado', valor1: true },
    ],
    limite: 50,
    desplazar: 0,
    ordenamientos: [],
    limite_conteo: 10000,
    modelo: 'RutVisita',
  };

  arrVehiculos: ListaVehiculo[] = [];
  arrVisitas: Visita[];

  private vehiculoService = inject(VehiculoService);
  private visitaService = inject(VisitaService);

  ngOnInit(): void {
    this.consultarLista();
    this.changeDetectorRef.detectChanges();
  }

  consultarLista() {
    forkJoin({
      vehiculos: this.vehiculoService.lista(this.arrParametrosConsulta),
      visitas: this.visitaService.lista(this.arrParametrosConsultaVisita),
    })
      .pipe(
        tap(({ vehiculos, visitas }) => {
          visitas.forEach((punto) => {
            this.addMarker({ lat: punto.latitud, lng: punto.longitud });
            this.changeDetectorRef.detectChanges();
          });
          this.arrVehiculos = vehiculos.registros;
          this.arrVisitas = visitas;
          this.changeDetectorRef.detectChanges();
        })
      )
      .subscribe();
  }

  ordenar() {
    this.visitaService.ordenar().subscribe((respuesta: any) => {
      this.alerta.mensajaExitoso('Se ha ordenado correctamente');
    });
  }

  rutear() {
    this.visitaService.rutear().subscribe(() => {
      this.consultarLista();
      this.alerta.mensajaExitoso('Se ha ruteado correctamente correctamente');
      this.router.navigate(['admin/trafico/lista']);
    });
  }

  addMarker(position: google.maps.LatLngLiteral) {
    this.markerPositions.push(position);
  }

  openInfoWindow(marker: MapMarker) {
    this.infoWindow.open(marker);
  }
}
