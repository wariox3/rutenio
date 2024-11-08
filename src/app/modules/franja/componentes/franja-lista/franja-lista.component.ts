import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ButtonComponent } from '../../../../common/components/ui/button/button.component';
import { General } from '../../../../common/clases/general';
import { FranjaService } from '../../servicios/franja.service';
import { Observable, tap } from 'rxjs';
import { Franja } from '../../../../interfaces/franja/franja.interface';
import {
  GoogleMapsModule,
  MapInfoWindow,
  MapMarker,
} from '@angular/google-maps';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import FranjaImportarPorKmlComponent from '../franja-importar-por-kml/franja-importar-por-kml.component';
import { ModalDefaultComponent } from '../../../../common/components/ui/modals/modal-default/modal-default.component';
import { KTModal } from '../../../../../metronic/core';

@Component({
  selector: 'app-franja-lista',
  standalone: true,
  imports: [
    CommonModule,
    ButtonComponent,
    GoogleMapsModule,
    FranjaImportarPorKmlComponent,
    ModalDefaultComponent,
  ],
  templateUrl: './franja-lista.component.html',
  styleUrl: './franja-lista.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class FranjaListaComponent extends General implements OnInit {
  @ViewChild(MapInfoWindow) infoWindow: MapInfoWindow;

  private _franjaService = inject(FranjaService);

  public markerPositions: google.maps.LatLngLiteral[] = [];
  public estaCreando: boolean = false;
  public zoom = 12;
  public center: google.maps.LatLngLiteral = {
    lat: 6.200713725811437,
    lng: -75.58609508555918,
  };
  public polylineOptions: google.maps.PolylineOptions = {
    strokeColor: '#FF0000',
    strokeOpacity: 1.0,
    strokeWeight: 3,
    editable: true,
    draggable: true,
  };
  public nuevaVertice: google.maps.LatLngLiteral[] = [];
  public franjasTotales: number;
  public franjas$: Observable<Franja[]>;
  public arrItems: any[];
  public cantidadRegistros: number = 0;
  public formularioFranja: FormGroup;
  public arrParametrosConsulta: any = {
    filtros: [],
    limite: 50,
    desplazar: 0,
    ordenamientos: [],
    limite_conteo: 10000,
    modelo: 'RutFranja',
  };

  constructor() {
    super();
    this.formularioFranja = new FormGroup({
      id: new FormControl('', Validators.compose([Validators.required])),
      codigo: new FormControl('', Validators.compose([Validators.required])),
      color: new FormControl(''),
      nombre: new FormControl('', Validators.compose([Validators.required])),
      coordenadas: new FormArray([]),
    });
  }

  ngOnInit(): void {
    this.consultarLista();
    this.consultarFranjas();
  }

  consultarFranjas() {
    this.franjas$ = this._franjaService.consultarFranjas().pipe(
      tap((respuesta) => {
        this.franjasTotales = respuesta.length;
      })
    );
  }

  consultarLista() {
    this._franjaService
      .lista(this.arrParametrosConsulta)
      .subscribe((respuesta) => {
        this.cantidadRegistros = respuesta.cantidad_registros;
        this.arrItems = respuesta.registros;
        this.changeDetectorRef.detectChanges();
      });
  }

  clickMap(evento: any) {
    const coordenadasFormArray = this.formularioFranja.get(
      'coordenadas'
    ) as FormArray;

    if (this.estaCreando) {
      this.nuevaVertice = [...this.nuevaVertice, evento.latLng.toJSON()];

      this.nuevaVertice.forEach((vertex) => {
        coordenadasFormArray.push(new FormControl(vertex));
      });
    }

    if (this.nuevaVertice.length === 3 && this.estaCreando) {
      this.formularioFranja.patchValue({
        codigo: `franja-${this.franjasTotales + 1}`,
        nombre: `franja-${this.franjasTotales + 1}`,
        color: '4d25a8f9',
      });

      this._franjaService
        .guardarFranja(this.formularioFranja.value)
        .subscribe((respuesta: any) => {
          this.alerta.mensajaExitoso('Se ha creado franja exitosamente.');
          this.consultarLista();
          this.consultarFranjas();
          this.estaCreando = false;
          this.nuevaVertice = [];
          coordenadasFormArray.clear();
          this.changeDetectorRef.detectChanges();
        });
    }
  }

  openInfoWindow(marker: MapMarker) {
    this.infoWindow.open(marker);
  }

  cerrarModal() {
    this.consultarLista();
    this.consultarFranjas();
    const modalEl: HTMLElement = document.querySelector('#importar-kml-modal  ');
    const modal = KTModal.getInstance(modalEl);

    modal.hide();
  }
}
