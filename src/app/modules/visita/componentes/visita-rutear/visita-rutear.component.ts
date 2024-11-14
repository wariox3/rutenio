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
  MapInfoWindow,
  MapMarker,
} from '@angular/google-maps';
import { NgSelectModule } from '@ng-select/ng-select';
import { BehaviorSubject, finalize, forkJoin, tap } from 'rxjs';
import { General } from '../../../../common/clases/general';
import { ProgresoCircularComponent } from '../../../../common/components/charts/progreso-circular/progreso-circular.component';
import { ButtonComponent } from '../../../../common/components/ui/button/button.component';
import { LabelComponent } from '../../../../common/components/ui/form/label/label.component';
import { ModalDefaultComponent } from '../../../../common/components/ui/modals/modal-default/modal-default.component';
import { ListaFlota } from '../../../../interfaces/flota/flota.interface';
import { ParametrosConsulta } from '../../../../interfaces/general/api.interface';
import { Visita } from '../../../../interfaces/visita/visita.interface';
import { FlotaService } from '../../../flota/servicios/flota.service';
import { VisitaService } from '../../servicios/visita.service';
import { AgregarFlotaComponent } from './components/agregar-flota/agregar-flota.component';

@Component({
  selector: 'app-visita-rutear',
  standalone: true,
  imports: [
    CommonModule,
    ButtonComponent,
    GoogleMapsModule,
    ProgresoCircularComponent,
    ModalDefaultComponent,
    LabelComponent,
    NgSelectModule,
    AgregarFlotaComponent,
  ],
  templateUrl: './visita.rutear.component.html',
  styleUrl: './visita-rutear.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class VisitaRutearComponent extends General implements OnInit {
  @ViewChild(MapInfoWindow) infoWindow: MapInfoWindow;

  public toggleModal$ = new BehaviorSubject(false);

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
    modelo: 'RutFlota',
  };

  arrParametrosConsultaVisita: ParametrosConsulta = {
    filtros: [
      // { propiedad: 'estado_despacho', valor1: false },
      // { propiedad: 'estado_decodificado', valor1: true },
    ],
    limite: 50,
    desplazar: 0,
    ordenamientos: [],
    limite_conteo: 10000,
    modelo: 'RutVisita',
  };

  arrFlota: ListaFlota[] = [];
  arrVisitas: Visita[];
  public flotasSeleccionadas: number[] = [];
  public capacidadTotal: number = 0;
  public pesoTotal: number = 0;
  public porcentajeCapacidad: number = 0;

  public cargandoConsultas$: BehaviorSubject<boolean>;
  private _flotaService = inject(FlotaService);
  private visitaService = inject(VisitaService);

  constructor() {
    super();
    this.cargandoConsultas$ = new BehaviorSubject(false);
  }

  ngOnInit(): void {
    this.consultarLista();
  }

  consultarLista() {
    this.consultarFlotas();
    this.consultarVisitas();
  }

  consultarVisitas() {
    this.visitaService
      .lista(this.arrParametrosConsultaVisita)
      .subscribe((respuesta) => {
        respuesta.forEach((punto) => {
          this.addMarker({ lat: punto.latitud, lng: punto.longitud });
          this.changeDetectorRef.detectChanges();
        });

        this._calcularPesoTotal(respuesta);
        this._calcularPorcentajeCapacidad();
        this.arrVisitas = respuesta;
        this.changeDetectorRef.detectChanges();
      });
  }

  consultarFlotas() {
    this.cargandoConsultas$.next(true);
    this._flotaService
      .lista(this.arrParametrosConsulta)
      .pipe(finalize(() => this.cargandoConsultas$.next(false)))
      .subscribe((response) => {
        this.flotasSeleccionadas = response.registros.map(
          (registro) => registro.vehiculo_id
        );

        this._calcularCapacidadTotal(response.registros);
        this._calcularPorcentajeCapacidad();
        this.arrFlota = response.registros;
        this.changeDetectorRef.detectChanges();
      });
  }

  private _calcularPorcentajeCapacidad() {
    if (this.pesoTotal <= 0 || this.capacidadTotal <= 0) {
      this.porcentajeCapacidad = 0;
    } else {
      let total = (this.pesoTotal / this.capacidadTotal) * 100;
      this.porcentajeCapacidad = this._redondear(total, 0);
    }
  }

  private _calcularCapacidadTotal(flotas: ListaFlota[]) {
    this.capacidadTotal = flotas.reduce(
      (acc, curVal) => acc + curVal.vehiculo_capacidad,
      0
    );
  }

  private _redondear(valor: number, decimales: number): number {
    const factor = Math.pow(10, decimales);
    return Math.round(valor * factor) / factor;
  }

  private _calcularPesoTotal(visitas: Visita[]) {
    this.pesoTotal = visitas.reduce((acc, curVal) => acc + curVal.peso, 0);
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

  abrirModal() {
    this.toggleModal$.next(true);
  }

  cerrarModal() {
    this.toggleModal$.next(false);
  }

  eliminarFlota(id: number) {
    this._flotaService.eliminarFlota(id).subscribe((response) => {
      this.consultarFlotas();
      this.alerta.mensajaExitoso('Flota eliminada');
    });
  }
}
