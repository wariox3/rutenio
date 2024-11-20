import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import {
  GoogleMapsModule,
  MapInfoWindow,
  MapMarker,
} from '@angular/google-maps';
import { NgSelectModule } from '@ng-select/ng-select';
import { BehaviorSubject, finalize, of, switchMap } from 'rxjs';
import { KTModal } from '../../../../../metronic/core';
import { General } from '../../../../common/clases/general';
import { ProgresoCircularComponent } from '../../../../common/components/charts/progreso-circular/progreso-circular.component';
import { ImportarComponent } from '../../../../common/components/importar/importar.component';
import { ButtonComponent } from '../../../../common/components/ui/button/button.component';
import { LabelComponent } from '../../../../common/components/ui/form/label/label.component';
import { ModalDefaultComponent } from '../../../../common/components/ui/modals/modal-default/modal-default.component';
import { PaginacionDefaultComponent } from '../../../../common/components/ui/paginacion/paginacion-default/paginacion-default.component';
import { ListaFlota } from '../../../../interfaces/flota/flota.interface';
import { ParametrosConsulta } from '../../../../interfaces/general/api.interface';
import { Visita } from '../../../../interfaces/visita/visita.interface';
import { FlotaService } from '../../../flota/servicios/flota.service';
import { VisitaService } from '../../servicios/visita.service';
import { AgregarFlotaComponent } from './components/agregar-flota/agregar-flota.component';
import { VisitaEditarRutearComponent } from "../visita-editar-rutear/visita-editar-rutear.component";

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
    PaginacionDefaultComponent,
    ImportarComponent,
    VisitaEditarRutearComponent
],
  templateUrl: './visita.rutear.component.html',
  styleUrl: './visita-rutear.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class VisitaRutearComponent extends General implements OnInit {
  @ViewChild(MapInfoWindow) infoWindow: MapInfoWindow;
  @ViewChildren(MapMarker) mapMarkers!: QueryList<MapMarker>;

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
  markerMap: Map<number, MapMarker> = new Map();

  arrParametrosConsulta: ParametrosConsulta = {
    filtros: [],
    limite: 50,
    desplazar: 0,
    ordenamientos: [],
    limite_conteo: 10000,
    modelo: 'RutFlota',
  };

  arrParametrosConsultaVisita: ParametrosConsulta = {
    filtros: [{ propiedad: 'estado_despacho', valor1: false }],
    limite: 50,
    desplazar: 0,
    ordenamientos: ["orden"],
    limite_conteo: 10000,
    modelo: 'RutVisita',
  };

  arrFlota: ListaFlota[] = [];
  arrVisitas: Visita[];
  public flotasSeleccionadas: number[] = [];
  public capacidadTotal: number = 0;
  public pesoTotal: number = 0;
  public porcentajeCapacidad: number = 0;
  public barraCapacidad: number = 0;
  public errorCapacidad: boolean = false;
  public cantidadErrores: number = 0;
  public visitasTotales: number = 0;
  public totalPaginasVisitas: number = 0;

  public cargandoConsultas$: BehaviorSubject<boolean>;
  private _flotaService = inject(FlotaService);
  private visitaService = inject(VisitaService);
  selectedVisita: any = null;
  visitarEditar:any;
  datos: any[];

  constructor() {
    super();
    this.cargandoConsultas$ = new BehaviorSubject(false);
  }

  ngOnInit(): void {
    this._initView();
  }

  private _initView() {
    this._consultarResumen()
      .pipe(
        switchMap(() => {
          this.consultarLista();
          return of(null);
        })
      )
      .subscribe();
  }

  consultarLista() {
    this.consultarFlotas(this.arrParametrosConsulta);
    this._consultarVisitas(this.arrParametrosConsultaVisita);
  }

  consultarVisitas() {
    this._consultarResumen()
      .pipe(
        switchMap(() => {
          this._consultarVisitas(this.arrParametrosConsultaVisita);
          return of(null);
        })
      )
      .subscribe();
  }

  private _consultarResumen() {
    return this.visitaService.visitaResumen().pipe(
      switchMap((response) => {
        this.visitasTotales = response?.resumen?.cantidad;
        this.pesoTotal = response?.resumen?.peso;
        this.changeDetectorRef.detectChanges();
        return of(null);
      })
    );
  }

  private _consultarErrores() {
    this.visitaService.visitaErrores().subscribe((response) => {
      this.cantidadErrores = response?.error?.cantidad;
      this.changeDetectorRef.detectChanges();
    });
  }

  private _limpiarBarraCapacidad() {
    this.barraCapacidad = 0;
    this.errorCapacidad = false;
    this.porcentajeCapacidad = 0;
    this.changeDetectorRef.detectChanges();
  }

  private calcularCantidadRegistros(
    cantidadRegistros: number,
    desplazamiento: number
  ) {
    return Math.ceil(cantidadRegistros / desplazamiento);
  }

  private _consultarVisitas(parametros: ParametrosConsulta) {
    this.visitaService.generalLista(parametros).subscribe((respuesta) => {
      this.limpiarMarkers();
      this._limpiarBarraCapacidad();
      this.totalPaginasVisitas = this.calcularCantidadRegistros(
        respuesta.cantidad_registros,
        this.arrParametrosConsultaVisita.limite
      );

      respuesta.registros.forEach((punto, index) => {
        const position = { lat: punto.latitud, lng: punto.longitud };
        this.addMarker(position, punto.id); // Agrega el ID de la visita
      });

      this._consultarErrores();
      this._calcularPorcentajeCapacidad();
      this.arrVisitas = respuesta.registros;
      this.changeDetectorRef.detectChanges();
    });
  }

  consultarFlotas(parametros: ParametrosConsulta) {
    this.cargandoConsultas$.next(true);
    this._flotaService
      .lista(parametros)
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

  paginar(evento: { limite: number; desplazar: number }) {
    const parametrosConsulta: ParametrosConsulta = {
      ...this.arrParametrosConsultaVisita,
      limite: evento.limite,
      desplazar: evento.desplazar,
    };

    this._consultarVisitas(parametrosConsulta);
  }

  private _calcularPorcentajeCapacidad() {
    let total = 0;
    if (this.capacidadTotal > 0) {
      total = (this.pesoTotal / this.capacidadTotal) * 100;
    }

    this.porcentajeCapacidad = this._redondear(total, 0);

    if (this.porcentajeCapacidad > 100) {
      this.barraCapacidad = 100;
      this.errorCapacidad = true;
    } else {
      this.barraCapacidad = this.porcentajeCapacidad;
      this.errorCapacidad = false;
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

  ordenar() {
    this.visitaService.ordenar().subscribe(() => {
      this.consultarLista();
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

  addMarker(position: google.maps.LatLngLiteral, visitaId: number) {
    this.markerPositions.push(position);
  }

  ngAfterViewInit() {
    this.mapMarkers.changes.subscribe(() => {
      this.mapMarkers.forEach((marker, index) => {
        const visita = this.arrVisitas[index];
        if (visita) {
          this.markerMap.set(visita.id, marker);
        }
      });
    });
  }

  limpiarMarkers() {
    this.markerPositions = [];
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
      this.consultarFlotas(this.arrParametrosConsulta);
      this.alerta.mensajaExitoso('Flota eliminada');
    });
  }

  confirmarEliminarTodos() {
    this.alerta
      .confirmar({
        titulo: '¿Estas seguro?',
        texto: 'Esta operación no se puede revertir',
        textoBotonCofirmacion: 'Si, eliminar',
      })
      .then((respuesta) => {
        if (respuesta.isConfirmed) {
          this._eliminarTodosLosRegistros();
        }
      });
  }

  confirmarEliminarErrores() {
    this.alerta
      .confirmar({
        titulo: '¿Estas seguro?',
        texto: 'Esta acción elimina las visitas con errores',
        textoBotonCofirmacion: 'Si, eliminar',
      })
      .then((respuesta) => {
        if (respuesta.isConfirmed) {
          this._eliminarVisitasConErrores();
        }
      });
  }

  private _eliminarVisitasConErrores() {
    if (this.arrVisitas.length > 0) {
      this.visitaService.eliminarVisitasConErrores().subscribe((response) => {
        this.alerta.mensajaExitoso(
          'Se han eliminado los regsitros correctamente.'
        );
        this.consultarVisitas();
      });
    } else {
      this.alerta.mensajeError('No hay visitas para eliminar', 'Error');
    }
  }

  private _eliminarTodosLosRegistros() {
    if (this.arrVisitas.length > 0) {
      this.visitaService
        .eliminarTodosLasGuias()
        .pipe(finalize(() => {}))
        .subscribe(() => {
          this.alerta.mensajaExitoso(
            'Se han eliminado los regsitros correctamente.'
          );
          this.consultarVisitas();
        });
    } else {
      this.alerta.mensajeError('No hay visitas para eliminar', 'Error');
    }
  }

  cerrarModalPorId(id: string) {
    const modalEl: HTMLElement = document.querySelector(id);
    const modal = KTModal.getInstance(modalEl);
    this.toggleModal$.next(false);

    modal.toggle();
  }

  habilitadoParaRutear() {
    return (
      this.errorCapacidad ||
      this.arrFlota?.length <= 0 ||
      this.cantidadErrores > 0 ||
      this.arrVisitas?.length <= 0
    );
  }

  evento(visita: any) {
    this.selectedVisita = visita;
    this.center = { lat: visita.latitud, lng: visita.longitud };
    this.zoom = 16;
    const marker = this.markerMap.get(visita.id);
    if (marker) {
      this.datos = visita.destinatario_direccion
      this.infoWindow.open(marker);
    }
  }

  editarModal(visita) {
    this.toggleModal$.next(true);
    this.visitarEditar = visita
  }

  visitaActualizada(id: string){
    this.cerrarModalPorId(id)
    this.consultarVisitas()
  }
  
}
