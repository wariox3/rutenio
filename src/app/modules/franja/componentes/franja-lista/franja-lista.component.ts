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
import { BehaviorSubject, map, Observable, of, switchMap, tap } from 'rxjs';
import { Franja } from '../../../../interfaces/franja/franja.interface';
import {
  GoogleMap,
  GoogleMapsModule,
  MapInfoWindow,
  MapMarker,
} from '@angular/google-maps';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import FranjaImportarPorKmlComponent from '../franja-importar-por-kml/franja-importar-por-kml.component';
import { ModalDefaultComponent } from '../../../../common/components/ui/modals/modal-default/modal-default.component';
import { KTModal } from '../../../../../metronic/core';
import FranjaEditarComponent from '../franja-editar/franja-editar.component';

@Component({
  selector: 'app-franja-lista',
  standalone: true,
  imports: [
    CommonModule,
    ButtonComponent,
    GoogleMapsModule,
    FranjaImportarPorKmlComponent,
    ModalDefaultComponent,
    FranjaEditarComponent,
  ],
  templateUrl: './franja-lista.component.html',
  styleUrl: './franja-lista.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class FranjaListaComponent extends General implements OnInit {
  @ViewChild(MapInfoWindow) infoWindow: MapInfoWindow;
  // google variables
  public markerPositions: google.maps.LatLngLiteral[] = [];
  public nuevaVertice: google.maps.LatLngLiteral[] = [];
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
    draggable: false,
  };

  public franjasTotales: number;
  public mostrarEditarFranjaModal$: BehaviorSubject<boolean>;
  public franjaSeleccionada: any;
  public estaCreando: boolean = false;
  public estaCerrado: boolean = false;
  public estaEditando: boolean = false;
  public cantidadRegistros: number = 0;
  public formularioFranja: FormGroup;
  public franjaClickeada: any = null
  public arrParametrosConsulta: any = {
    filtros: [],
    limite: 500,
    desplazar: 0,
    ordenamientos: ["-id"],
    limite_conteo: 10000,
    modelo: 'RutFranja',
  };

  private _franjaService = inject(FranjaService);
  private franjasSubject = new BehaviorSubject<Franja[]>([]);
  franjas$ = this.franjasSubject.asObservable();
  @ViewChild('map', { static: false }) map!: GoogleMap;
  editableFranja: google.maps.Polygon | null = null;


  constructor() {
    super();
    this.mostrarEditarFranjaModal$ = new BehaviorSubject(false);
    this.formularioFranja = new FormGroup({
      id: new FormControl('', Validators.compose([Validators.required])),
      codigo: new FormControl('', Validators.compose([Validators.required])),
      color: new FormControl(''),
      nombre: new FormControl('', Validators.compose([Validators.required])),
      coordenadas: new FormArray([]),
    });
  }

  ngOnInit(): void {
    this.consultarFranjas();
  }

  consultarFranjas() {
    this._franjaService
      .lista(this.arrParametrosConsulta)
      .pipe(
        tap((respuesta) => {
          this.cantidadRegistros = respuesta.cantidad_registros;
        }),
        map((respuesta) => respuesta.registros)
      )
      .subscribe((registros) => {
        this.franjasSubject.next(registros);
      });
  }

  toggleModal(action: 'editar-franja') {
    switch (action) {
      case 'editar-franja':
        this._toggleEditarFranja();
        break;
      default:
    }
  }

  private _toggleEditarFranja() {
    const valor = this.mostrarEditarFranjaModal$.value;
    this.mostrarEditarFranjaModal$.next(!valor);
  }

  seleccionarFranja(item: any) {
    this.franjaSeleccionada = item;

    const coordenadasArray = this.formularioFranja.get(
      'coordenadas'
    ) as FormArray;
    coordenadasArray.clear();

    this.formularioFranja.patchValue({
      codigo: item.codigo,
      id: item.id,
      color: item.color,
      nombre: item.nombre,
    });

    item.coordenadas.forEach((coordenada: any) => {
      coordenadasArray.push(new FormControl(coordenada));
    });

    this.changeDetectorRef.detectChanges();
  }

  toggleEstaCreando() {
    this.estaCreando = !this.estaCreando;
  }

  confirmarEliminarFranja(item: any) {
    this.alerta
      .confirmar({
        titulo: '¿Estas seguro?',
        texto: 'Esta operación no se puede revertir',
        textoBotonCofirmacion: 'Si, eliminar',
      })
      .then((respuesta) => {
        if (respuesta.isConfirmed) {
          this.eliminarFranja(item);
        }
      });
  }

  eliminarFranja(item: any) {
    this._franjaService.eliminarFranja(item.id).subscribe(() => {
      this.alerta.mensajaExitoso(
        'Se ha eliminado la franja exitosamente.',
        'Guardado con éxito.'
      );
      this.limpiarMapa();
      this.consultarFranjas();
    });
  }

  limpiarMapa() {
    this.markerPositions = [];
    if (this.editableFranja) {
      this.editableFranja.setMap(null);
      this.editableFranja = null;
    }
    this.changeDetectorRef.detectChanges();
  }

  openInfoWindow(marker: MapMarker) {
    this.infoWindow.open(marker);
  }

  cerrarModal() {
    this.mostrarEditarFranjaModal$.next(false);
  }

  abrirModal() {
    this.mostrarEditarFranjaModal$.next(true);
  }

  cerrarModalPorId(modalId: string) {
    this.consultarFranjas();
    const modalEl: HTMLElement = document.querySelector(modalId);
    const modal = KTModal.getInstance(modalEl);

    modal.hide();
    this.resetCrearPoligono();
    this.limpiarMapa();
  }

  clickMap(evento: any) {
    const coordenadasFormArray = this.formularioFranja.get('coordenadas') as FormArray;
  
    if (this.estaCreando) {
      // Asegúrate de que las coordenadas son solo de la nueva franja
      const nuevoVertice = evento.latLng.toJSON();
      this.nuevaVertice = [...this.nuevaVertice, nuevoVertice];
      coordenadasFormArray.push(new FormControl(nuevoVertice));
    }
  
    if (this.editableFranja) {
      this.editableFranja.setEditable(false);
      this.editableFranja.setMap(null);
    }
    this.changeDetectorRef.detectChanges();
  }

  cerrarPoligono() {
    this.estaCerrado = true;
    this.nuevaVertice.push(this.nuevaVertice[0]);
  }

  finalizarPoligono() {
    if (this.nuevaVertice.length < 3) {
      this.alerta.mensajeError(
        'Error',
        'El polígono debe tener al menos 3 vértices.'
      );
      return;
    }

    if (!this.estaCerrado) {
      this.cerrarPoligono();
    }

    const colorAleatorio = this.generarColorAleatorio();

    this.formularioFranja.patchValue({
      codigo: `franja-${this.franjasTotales + 1}`,
      nombre: `franja-${this.franjasTotales + 1}`,
      color: colorAleatorio, // Usamos el color generado
    });

    this._franjaService
      .guardarFranja(this.formularioFranja.value)
      .subscribe(() => {
        this.alerta.mensajaExitoso('Se ha creado la franja exitosamente.');
        this.consultarFranjas();
        this.resetCrearPoligono();
      });

      this.changeDetectorRef.detectChanges();
  }

  resetCrearPoligono() {
    this.estaCreando = false;
    this.estaCerrado = false; 
    this.nuevaVertice = [];
    const coordenadasFormArray = this.formularioFranja.get('coordenadas') as FormArray;
    coordenadasFormArray.clear();
    this.changeDetectorRef.detectChanges();
  }

  private generarColorAleatorio(): string {
    const generarComponente = () => Math.floor(Math.random() * 100 + 30);
    const r = generarComponente().toString(16).padStart(2, '0'); 
    const g = generarComponente().toString(16).padStart(2, '0');
    const b = generarComponente().toString(16).padStart(2, '0');
    return `${r}${g}${b}`;
  }

  habiliarFranja(franja: any) {
    this.franjaClickeada = franja.id
    if (this.editableFranja) {
      this.editableFranja.setEditable(false);
      this.editableFranja.setMap(null);
    }

    const polygon = new google.maps.Polygon({
      paths: franja.coordenadas,
      editable: true,
      draggable: false,
    });

    const googleMapInstance = this.map.googleMap;

    polygon.setMap(googleMapInstance);
    this.editableFranja = polygon;
    google.maps.event.addListener(polygon.getPath(), 'set_at', () => {
      this._guardarEdicionPoligo(franja, polygon.getPath());
    });

    google.maps.event.addListener(polygon.getPath(), 'insert_at', () => {
      this._guardarEdicionPoligo(franja, polygon.getPath());
    });
  }



  private _guardarEdicionPoligo(
    polygon: any,
    path: google.maps.MVCArray<google.maps.LatLng>
  ) {
    const updatedCoordinates = [];
    for (let i = 0; i < path.getLength(); i++) {
      const point = path.getAt(i).toJSON();
      updatedCoordinates.push(point);
    }

    this._franjaService
      .actualizarFranja(polygon.id, {
        nombre: polygon.nombre,
        coordenadas: updatedCoordinates,
      })
      .subscribe((response) => {
        this.consultarFranjas()
      });
  }
}
