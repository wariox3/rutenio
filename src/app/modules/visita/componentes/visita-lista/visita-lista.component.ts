import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MapDirectionsService } from '@angular/google-maps';
import { RouterLink } from '@angular/router';
import { BehaviorSubject, finalize, forkJoin, Subject, takeUntil } from 'rxjs';
import { KTModal } from '../../../../../metronic/core';
import { General } from '../../../../common/clases/general';
import { FiltroBaseService } from '../../../../common/components/filtros/filtro-base/services/filtro-base.service';
import { ImportarComponent } from '../../../../common/components/importar/importar.component';
import { ButtonComponent } from '../../../../common/components/ui/button/button.component';
import { ModalDefaultComponent } from '../../../../common/components/ui/modals/modal-default/modal-default.component';
import { TablaComunComponent } from '../../../../common/components/ui/tablas/tabla-comun/tabla-comun.component';
import { mapeo } from '../../../../common/mapeos/documentos';
import { GeneralService } from '../../../../common/services/general.service';
import { GeneralApiService } from '../../../../core';
import { ParametrosApi, RespuestaApi } from '../../../../core/types/api.type';
import { Visita } from '../../interfaces/visita.interface';
import { guiaMapeo } from '../../mapeos/guia-mapeo';
import { VisitaApiService } from '../../servicios/visita-api.service';
import { VisitaImportarPorComplementoComponent } from '../visita-importar-por-complemento/visita-importar-por-complemento.component';
import { PaginadorComponent } from '../../../../common/components/ui/paginacion/paginador/paginador.component';
import { FiltroComponent } from '../../../../common/components/ui/filtro/filtro.component';
import { FilterCondition } from '../../../../core/interfaces/filtro.interface';
import { VISITA_LISTA_FILTERS } from '../../mapeos/visita-lista-mapeo';

@Component({
  selector: 'app-visita-lista',
  standalone: true,
  imports: [
    CommonModule,
    ButtonComponent,
    TablaComunComponent,
    VisitaImportarPorComplementoComponent,
    ModalDefaultComponent,
    ImportarComponent,
    ReactiveFormsModule,
    RouterLink,
    PaginadorComponent,
    FiltroComponent
  ],
  templateUrl: './visita-lista.component.html',
  styleUrl: './visita-lista.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class VisitaListaComponent extends General implements OnInit {
  private _visitaApiService = inject(VisitaApiService);
  private _generalApiService = inject(GeneralApiService);
  private _directionsService = inject(MapDirectionsService);
  private _listaItemsEliminar: number[] = [];
  private _generalService = inject(GeneralService);
  private _filtroBaseService = inject(FiltroBaseService);

  public actualizandoLista = signal<boolean>(false);
  public guiaMapeo = guiaMapeo
  public VISITA_LISTA_FILTERS = VISITA_LISTA_FILTERS
  public toggleModalImportarComplemento$ = new BehaviorSubject(false);
  public toggleModalImportarExcel$ = new BehaviorSubject(false);
  public nombreFiltro = '';
  public cantidadRegistros: number = 0;
  public arrGuia: any[];
  public arrGuiasOrdenadas: any[];
  public mapeoDocumento = mapeo;
  public markerPositions: google.maps.LatLngLiteral[] = [];
  public directionsResults: google.maps.DirectionsResult | undefined;
  public marcarPosicionesVisitasOrdenadas: google.maps.LatLngLiteral[] = [
    { lat: 6.200713725811437, lng: -75.58609508555918 },
  ];
  public arrParametrosConsulta: ParametrosApi = {
    limit: 50,
    ordering: '-id',
  };
  public currentPage = signal(1);
  public totalPages = signal(1);
  public totalItems: number = 0;
  public filtroKey = signal<string>('');

  public formularioFiltros = new FormGroup({
    id: new FormControl(''),
    guia: new FormControl(''),
    estado_decodificado: new FormControl('todos'),
  });
  private destroy$ = new Subject<void>();

  constructor() {
    super();
  }

  ngOnInit(): void {
    this._construirFiltros();
    this.filtroKey.set(
      'visita_lista_filtro'
    );
    this.consultaLista(this.arrParametrosConsulta);
  }

  private _construirFiltros() {
    this.nombreFiltro = this._filtroBaseService.construirFiltroKey();
    const filtroGuardado = localStorage.getItem(this.nombreFiltro);
    if (filtroGuardado !== null) {
      const filtros = JSON.parse(filtroGuardado);
      //this.arrParametrosConsulta.filtros = [...filtros];
    }
  }

  recargarConsulta() {

    this._generalApiService
      .consultaApi<RespuestaApi<Visita>>('ruteo/visita/', { limit: 50 })
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.actualizandoLista.set(false);
        })
      )
      .subscribe((respuesta) => {
        this.arrGuia = respuesta.results?.map((guia) => ({
          ...guia,
          selected: false,
        }));
        this.cantidadRegistros = respuesta?.results?.length;
        respuesta?.results?.forEach((punto) => {
          this.addMarker({ lat: punto.latitud, lng: punto.longitud });
        });
        this.alerta.mensajaExitoso('Se ha actualizado correctamente', 'Actualizado');
        this.changeDetectorRef.detectChanges();
      });
    if (this.arrGuiasOrdenadas?.length >= 1) {
      this.arrGuiasOrdenadas.forEach((punto) => {
        this.addMarkerOrdenadas({ lat: punto.latitud, lng: punto.longitud });
      });
      this.calculateRoute();
      this.changeDetectorRef.detectChanges();
    }
  }

  consultaLista(filtros: Record<string, any>) {
    this._generalApiService
      .consultaApi<RespuestaApi<Visita>>('ruteo/visita/', { limit: 50, serializador: 'lista', ...filtros })
      .pipe(takeUntil(this.destroy$))
      .subscribe((respuesta) => this._procesarRespuestaLista(respuesta));
  }


  addMarker(position: google.maps.LatLngLiteral) {
    this.markerPositions.push(position);
  }

  addMarkerOrdenadas(position: google.maps.LatLngLiteral) {
    this.marcarPosicionesVisitasOrdenadas.push(position);
  }

  decodificar() {
    this._visitaApiService.decodificar().subscribe(() => {
      this.consultaLista(this.arrParametrosConsulta);
      this.alerta.mensajaExitoso('Se ha decodificado correctamente');
    });
  }

  ordenar() {
    this._visitaApiService.ordenar().subscribe((respuesta: any) => {
      this.arrGuiasOrdenadas = respuesta.visitas_ordenadas;
      this.consultaLista(this.arrParametrosConsulta);
      this.alerta.mensajaExitoso('Se ha ordenado correctamente');
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
          this.eliminarTodosLosRegistros();
        }
      });
  }

  eliminarTodosLosRegistros() {
    if (this.arrGuia.length > 0) {
      // this.eliminandoRegistros = true;
      this._visitaApiService
        .eliminarTodos()
        .pipe(
          finalize(() => {
            // this.eliminandoRegistros = false;
            // this.isCheckedSeleccionarTodos = false;
          })
        )
        .subscribe(() => {
          this.alerta.mensajaExitoso(
            'Se han eliminado los registros correctamente.'
          );
          this.consultaLista(this.arrParametrosConsulta);
        });
    } else {
      this.alerta.mensajeError(
        'No se han seleccionado registros para eliminar',
        'Error'
      );
    }
  }

  calculateRoute() {
    if (this.marcarPosicionesVisitasOrdenadas.length < 2) {
      console.error('Se necesitan al menos dos puntos para calcular la ruta.');
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
      optimizeWaypoints: false, // Cambia a true si quieres optimizar el orden de las paradas
    };

    this._directionsService.route(request).subscribe({
      next: (response) => {
        this.directionsResults = response.result;
        this.changeDetectorRef.detectChanges();
      },
      error: (e) => console.error(e),
    });
  }

  cerrarModalPorId(id: string) {
    const modalEl: HTMLElement = document.querySelector(id);
    const modal = KTModal.getInstance(modalEl);
    if (id === '#importar-por-excel-modal') {
      this.cerrarModalImportarExcel();
    }
    if (id === '#importar-por-complemento-modal') {
      this.cerrarModalImportarComplemento();
    }
    modal.hide();
  }

  abrirModalImportarExcel() {
    this.toggleModalImportarExcel$.next(true);
  }

  abrirModalImportarComplemento() {
    this.toggleModalImportarComplemento$.next(true);
  }

  cerrarModalImportarExcel() {
    this.toggleModalImportarExcel$.next(false);
  }

  cerrarModalImportarComplemento() {
    this.toggleModalImportarComplemento$.next(false);
  }

  actualizarItemsSeleccionados(itemsSeleccionados: number[]) {
    this._listaItemsEliminar = itemsSeleccionados;
  }

  eliminarItemsSeleccionados() {
    const eliminarRegistros = this._listaItemsEliminar.map((id) => {
      return this._visitaApiService.eliminarPorId(id);
    });

    forkJoin(eliminarRegistros)
      .pipe(
        finalize(() => {
          this._listaItemsEliminar = [];
          this.consultaLista(this.arrParametrosConsulta);
          this.changeDetectorRef.detectChanges();
        })
      )
      .subscribe((respuesta: any) => {
        this.alerta.mensajaExitoso('Registros eliminado');
      });
  }

  exportarExcel() {
    this._generalService.descargarArchivo(`ruteo/visita`, {
      ...this.arrParametrosConsulta,
      limit: 5000,
      serializador: 'excel',
    });
  }

  detalleVisita(id: number) {
    this.router.navigateByUrl(`/movimiento/visita/detalle/${id}`);
  }

  filterChange(filters: Record<string, any>) {
    // this._generalApiService
    //   .consultaApi<RespuestaApi<Visita>>('ruteo/visita/', {
    //     limit: 50,
    //     ...filters,
    //   })
    //   .pipe(takeUntil(this.destroy$))
    //   .subscribe((respuesta) => this._procesarRespuestaLista(respuesta));
    this.consultaLista(filters);
  }

  onPageChange(page: number): void {
    // this._generalApiService
    //   .consultaApi<RespuestaApi<Visita>>('ruteo/visita/', {
    //     limit: 50,
    //     page,
    //   })
    //   .pipe(takeUntil(this.destroy$))
    //   .subscribe((respuesta) => this._procesarRespuestaLista(respuesta));
    this.consultaLista({ page });
  }


  private _procesarRespuestaLista(respuesta: RespuestaApi<Visita>, ordenarRuta = true): void {
    this.arrGuia = respuesta.results?.map((guia) => ({
      ...guia,
      selected: false,
    })) ?? [];
    this.cantidadRegistros = respuesta?.count || 0;
    this.totalItems = respuesta?.count || 0;

    this.markerPositions = [];
    respuesta?.results?.forEach((punto) => {
      this.addMarker({ lat: punto.latitud, lng: punto.longitud });
    });

    // if (ordenarRuta) this.calculateRoute();
    this.changeDetectorRef.detectChanges();
  }


}
