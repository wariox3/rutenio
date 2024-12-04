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
import { BehaviorSubject, finalize, Observable, of, switchMap } from 'rxjs';
import { KTModal } from '../../../../../metronic/core';
import { General } from '../../../../common/clases/general';
import { ProgresoCircularComponent } from '../../../../common/components/charts/progreso-circular/progreso-circular.component';
import { FiltroBaseComponent } from '../../../../common/components/filtros/filtro-base/filtro-base.component';
import { ImportarComponent } from '../../../../common/components/importar/importar.component';
import { ButtonComponent } from '../../../../common/components/ui/button/button.component';
import { ModalDefaultComponent } from '../../../../common/components/ui/modals/modal-default/modal-default.component';
import { PaginacionDefaultComponent } from '../../../../common/components/ui/paginacion/paginacion-default/paginacion-default.component';
import { ListaFlota } from '../../../../interfaces/flota/flota.interface';
import { ParametrosConsulta } from '../../../../interfaces/general/api.interface';
import { Visita } from '../../../../interfaces/visita/visita.interface';
import { FlotaService } from '../../../flota/servicios/flota.service';
import { visitaRutearMapeo } from '../../mapeos/visita-rutear.mapeo';
import { VisitaService } from '../../servicios/visita.service';
import { VisitaEditarRutearComponent } from '../visita-editar-rutear/visita-editar-rutear.component';
import { AgregarFlotaComponent } from './components/agregar-flota/agregar-flota.component';
import { VisitaRutearDetalleComponent } from './components/visita-detalle/visita-rutear-detalle.component';
import { VisitaRutearService } from '../../servicios/visita-rutear.service';
import { FullLoaderDefaultComponent } from '../../../../common/components/spinners/full-loader-default/full-loader-default.component';
import { FranjaService } from '../../../franja/servicios/franja.service';
import { Franja } from '../../../../interfaces/franja/franja.interface';
import { SwitchComponent } from '../../../../common/components/ui/form/switch/switch.component';
import { FiltroBaseService } from '../../../../common/components/filtros/filtro-base/services/filtro-base.service';
import { VisitaResumenPedienteComponent } from "../visita-resumen-pediente/visita-resumen-pediente.component";

@Component({
  selector: 'app-visita-rutear',
  standalone: true,
  imports: [
    CommonModule,
    ButtonComponent,
    GoogleMapsModule,
    ProgresoCircularComponent,
    ModalDefaultComponent,
    NgSelectModule,
    AgregarFlotaComponent,
    PaginacionDefaultComponent,
    ImportarComponent,
    VisitaEditarRutearComponent,
    FiltroBaseComponent,
    VisitaRutearDetalleComponent,
    FullLoaderDefaultComponent,
    VisitaResumenPedienteComponent
],
  templateUrl: './visita.rutear.component.html',
  styleUrl: './visita-rutear.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class VisitaRutearComponent extends General implements OnInit {
  @ViewChild(MapInfoWindow) infoWindow: MapInfoWindow;
  @ViewChildren(MapMarker) mapMarkers!: QueryList<MapMarker>;

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
    ordenamientos: [
      'estado_decodificado',
      '-estado_decodificado_alerta',
      'orden',
    ],
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
  public cantidadAlertas: number = 0;
  public visitasTotales: number = 0;
  public totalRegistrosVisitas: number = 0;
  public mapeo = visitaRutearMapeo;
  public valoresFiltrados: string = '';
  public mostarVistaCargando$: BehaviorSubject<boolean>;
  public cargandoConsultas$: BehaviorSubject<boolean>;
  public franjas$: Observable<Franja[]>;
  public mostrarFranjas$: BehaviorSubject<boolean>;
  public toggleModal$ = new BehaviorSubject(false);
  public toggleModalVisitaResumen$ = new BehaviorSubject(false);

  private _flotaService = inject(FlotaService);
  private _filtroBaseService = inject(FiltroBaseService);
  private visitaService = inject(VisitaService);
  private _visitaRutearService = inject(VisitaRutearService);
  private _franjaService = inject(FranjaService);
  selectedVisita: any = null;
  visitarEditar: any;
  datos: any[];
  visitaResumen : any;

  constructor() {
    super();
    this.cargandoConsultas$ = new BehaviorSubject(false);
    this.mostarVistaCargando$ = new BehaviorSubject(false);
    this.mostrarFranjas$ = new BehaviorSubject(false);
  }

  ngOnInit(): void {
    this._aplicarFiltrosPermanentes();
    this._initView();
  }

  private _aplicarFiltrosPermanentes() {
    const filtroKey = this._filtroBaseService.construirFiltroKey();
    let filtrosPermanentesKey = localStorage.getItem(filtroKey);
    let parametrosConsulta = [];

    if (filtrosPermanentesKey === null) {
      return null;
    }

    parametrosConsulta = JSON.parse(filtrosPermanentesKey);

    this.arrParametrosConsultaVisita = {
      ...this.arrParametrosConsultaVisita,
      filtros: [
        ...this.arrParametrosConsultaVisita.filtros,
        ...parametrosConsulta,
      ],
    };

    this._actualizarFiltrosParaMostrar(parametrosConsulta);
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

    this.consultarFranjas();
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
    return this.visitaService
      .visitaResumen(this.arrParametrosConsultaVisita)
      .pipe(
        switchMap((response) => {
          this.visitasTotales = response?.resumen?.cantidad;
          this.cantidadErrores = response?.errores?.cantidad;
          this.cantidadAlertas = response?.alertas?.cantidad;
          this.pesoTotal = response?.resumen?.peso;
          this.changeDetectorRef.detectChanges();
          return of(null);
        })
      );
  }

  private _limpiarBarraCapacidad() {
    this.barraCapacidad = 0;
    this.errorCapacidad = false;
    this.porcentajeCapacidad = 0;
    this.changeDetectorRef.detectChanges();
  }

  private _consultarVisitas(parametros: ParametrosConsulta) {
    this.visitaService.generalLista(parametros).subscribe((respuesta) => {
      this.limpiarMarkers();
      this._limpiarBarraCapacidad();
      this.totalRegistrosVisitas = respuesta.cantidad_registros;

      respuesta.registros.forEach((punto) => {
        const position = { lat: punto.latitud, lng: punto.longitud };
        this.addMarker(position, punto.id); // Agrega el ID de la visita
      });

      // this._consultarErrores();
      this._calcularPorcentajeCapacidad();
      this.arrVisitas = respuesta.registros;
      this.changeDetectorRef.detectChanges();
    });
  }

  consultarFranjas() {
    this.franjas$ = this._franjaService.consultarFranjas();
  }

  toggleMostrarFranjas() {
    const currentValue = this.mostrarFranjas$.getValue();
    this.mostrarFranjas$.next(!currentValue);
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
    this.mostarVistaCargando$.next(true);
    this.visitaService
      .ordenar(this.arrParametrosConsultaVisita)
      .pipe(
        finalize(() => {
          this.mostarVistaCargando$.next(false);
        })
      )
      .subscribe(() => {
        this.consultarLista();
        this.alerta.mensajaExitoso('Se ha ordenado correctamente');
      });
  }

  rutear() {
    this.visitaService.rutear(this.arrParametrosConsultaVisita).subscribe(() => {
      this.consultarLista();
      this.alerta.mensajaExitoso('Se ha ruteado correctamente correctamente');
      this.router.navigate(['admin/diseno-ruta/lista']);
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

  openInfoWindow(marker: MapMarker, index: number) {
    this.selectedVisita = this.arrVisitas[index];
    this.scrollToRow(this.selectedVisita.id);
    this.infoWindow.open(marker);
  }

  scrollToRow(index: number): void {
    if (window.innerWidth >= 1280) {
      const row = document.getElementById(`fila-${index}`);
      if (row) {
        row.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
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
      this.visitasTotales <= 0
    );
  }

  evento(visita: any) {
    this.selectedVisita = visita;
    this.center = { lat: visita.latitud, lng: visita.longitud };
    const marker = this.markerMap.get(visita.id);
    if (marker) {
      this.infoWindow.open(marker);
    }
  }

  editarModal(visita) {
    this.toggleModal$.next(true);
    this.visitarEditar = visita;
  }

  visitaActualizada(id: string) {
    this.cerrarModalPorId(id);
    this.consultarVisitas();
  }

  private _actualizarFiltrosParaMostrar(filtros: any[]) {
    this.valoresFiltrados = '';
    filtros.forEach((filtro, index) => {
      this.valoresFiltrados += filtro.valor1;
      if (index + 1 < filtros.length) {
        this.valoresFiltrados += ', ';
      }
    });
  }

  filtrosPersonalizados(filtros: any[], modalId: string) {
    if (filtros.length >= 1) {
      this.arrParametrosConsultaVisita.filtros = [
        { propiedad: 'estado_despacho', valor1: false },
        ...filtros,
      ];
    } else {
      this.arrParametrosConsultaVisita.filtros = [
        { propiedad: 'estado_despacho', valor1: false },
      ];
    }

    this._actualizarFiltrosParaMostrar(filtros);

    this._consultarVisitas(this.arrParametrosConsultaVisita);
    this._consultarResumen().subscribe();
    this.cerrarModalPorId(modalId);
  }

  ubicarFranja() {
    this.mostarVistaCargando$.next(true);
    this._visitaRutearService
      .ubicarFranja(this.arrParametrosConsultaVisita)
      .pipe(
        finalize(() => {
          this.mostarVistaCargando$.next(false);
        })
      )
      .subscribe((response) => {
        this.alerta.mensajaExitoso(response.mensaje);
        this.consultarVisitas();
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

  eliminarVisita(id){
    this.visitaService.eliminarVisita(id).subscribe({
      next: (response) => {
        this.alerta.mensajaExitoso('Visita eliminada exitosamente');
        this._consultarVisitas(this.arrParametrosConsultaVisita);
        this._consultarResumen().subscribe();
      },
    });
  }

  abrirModalResumen() {
    this.toggleModalVisitaResumen$.next(true);
    this.resumen()
  }

  resumen(){
    this.visitaService.resumenPendiente().subscribe({
      next: (response) => {  
        this.visitaResumen = response.resumen
        console.log(this.visitaResumen);
        
        this.changeDetectorRef.detectChanges();
      }
    })
  }

  // filtrosPersonalizados(filtros: any, modalId: string) {
  //   let parametrosConsulta: ParametrosConsulta = {
  //     ...this.arrParametrosConsultaVisita,
  //   };

  //   if (filtros.length >= 1) {
  //     parametrosConsulta = {
  //       ...parametrosConsulta,
  //       filtros: [...this.arrParametrosConsultaVisita.filtros, ...filtros],
  //     };
  //   }

  //   this._consultarVisitas(parametrosConsulta);
  //   this.cerrarModalPorId(modalId);
  // }
}
