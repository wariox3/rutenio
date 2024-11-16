import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
} from '@angular/core';
import { ButtonComponent } from '../../../../common/components/ui/button/button.component';
import { TablaComunComponent } from '../../../../common/components/ui/tablas/tabla-comun/tabla-comun.component';
import { mapeo } from '../../../../common/mapeos/documentos';
import { VisitaService } from '../../servicios/visita.service';
import { ParametrosConsulta } from '../../../../interfaces/general/api.interface';
import { General } from '../../../../common/clases/general';
import { MapDirectionsService } from '@angular/google-maps';
import { VisitaImportarPorComplementoComponent } from '../visita-importar-por-complemento/visita-importar-por-complemento.component';
import { ModalDefaultComponent } from '../../../../common/components/ui/modals/modal-default/modal-default.component';
import VisitaImportarPorExcelComponent from '../visita-importar-por-excel/visita-importar-por-excel.component';
import { BehaviorSubject, finalize, forkJoin } from 'rxjs';
import { KTModal } from '../../../../../metronic/core';
import { ImportarComponent } from '../../../../common/components/importar/importar.component';
import { GeneralService } from '../../../../common/services/general.service';
import { LabelComponent } from '../../../../common/components/ui/form/label/label.component';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { PaginacionAvanzadaComponent } from "../../../../common/components/paginacion/paginacion-avanzada/paginacion-avanzada.component";

@Component({
  selector: 'app-visita-lista',
  standalone: true,
  imports: [
    CommonModule,
    ButtonComponent,
    TablaComunComponent,
    VisitaImportarPorComplementoComponent,
    VisitaImportarPorExcelComponent,
    ModalDefaultComponent,
    ImportarComponent,
    LabelComponent,
    ReactiveFormsModule,
    PaginacionAvanzadaComponent
],
  templateUrl: './visita-lista.component.html',
  styleUrl: './visita-lista.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class VisitaListaComponent extends General implements OnInit {
  private _visitaService = inject(VisitaService);
  private _directionsService = inject(MapDirectionsService);
  private _listaItemsEliminar: number[] = [];
  private _generalService = inject(GeneralService);

  public toggleModal$ = new BehaviorSubject(false);
  public cantidadRegistros: number = 0;
  public arrGuia: any[];
  public arrGuiasOrdenadas: any[];
  public mapeoDocumento = mapeo;
  public markerPositions: google.maps.LatLngLiteral[] = [];
  public directionsResults: google.maps.DirectionsResult | undefined;
  public marcarPosicionesVisitasOrdenadas: google.maps.LatLngLiteral[] = [
    { lat: 6.200713725811437, lng: -75.58609508555918 },
  ];
  public arrParametrosConsulta: ParametrosConsulta = {
    filtros: [],
    limite: 50,
    desplazar: 0,
    ordenamientos: [],
    limite_conteo: 10000,
    modelo: 'RutVisita',
  };
  public formularioFiltros = new FormGroup({
    id: new FormControl(''),
    guia: new FormControl(''),
    estado_decodificado: new FormControl('todos'),
  });

  constructor() {
    super();
  }

  ngOnInit(): void {
    this.consultaLista(this.arrParametrosConsulta);
  }

  consultaLista(filtros: any) {
    // this.isCheckedSeleccionarTodos = false;
    // this.registrosAEliminar = [];
    this._visitaService.generalLista(filtros).subscribe((respuesta) => {
      this.arrGuia = respuesta.registros?.map((guia) => ({
        ...guia,
        selected: false,
      }));
      this.cantidadRegistros = respuesta?.registros?.length;
      respuesta?.registros?.forEach((punto) => {
        this.addMarker({ lat: punto.latitud, lng: punto.longitud });
      });
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

  addMarker(position: google.maps.LatLngLiteral) {
    this.markerPositions.push(position);
  }

  addMarkerOrdenadas(position: google.maps.LatLngLiteral) {
    this.marcarPosicionesVisitasOrdenadas.push(position);
  }

  decodificar() {
    this._visitaService.decodificar().subscribe(() => {
      this.consultaLista(this.arrParametrosConsulta);
      this.alerta.mensajaExitoso('Se ha decodificado correctamente');
    });
  }

  ordenar() {
    this._visitaService.ordenar().subscribe((respuesta: any) => {
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
      this._visitaService
        .eliminarTodosLasGuias()
        .pipe(
          finalize(() => {
            // this.eliminandoRegistros = false;
            // this.isCheckedSeleccionarTodos = false;
          })
        )
        .subscribe(() => {
          this.alerta.mensajaExitoso(
            'Se han eliminado los regsitros correctamente.'
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
    this.toggleModal$.next(false);

    modal.hide();
  }

  abrirModal() {
    this.toggleModal$.next(true);
  }

  cerrarModal() {
    this.toggleModal$.next(false);
  }

  actualizarItemsSeleccionados(itemsSeleccionados: number[]) {
    this._listaItemsEliminar = itemsSeleccionados;
  }

  eliminarItemsSeleccionados() {
    const eliminarRegistros = this._listaItemsEliminar.map((id) => {
      return this._visitaService.eliminarVisita(id);
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
    this._generalService.descargarArchivo(`general/funcionalidad/lista/`, {
      ...this.arrParametrosConsulta,
      excel: true,
      ...{
        limite: 5000,
      },
    });
  }

  aplicarFiltros() {
    const id = this.formularioFiltros.get('id').value;
    const guia = this.formularioFiltros.get('guia').value;
    const estadoDecodificado = this.formularioFiltros.get(
      'estado_decodificado'
    ).value;

    let parametrosConsulta: ParametrosConsulta = {
      ...this.arrParametrosConsulta,
      filtros: [
        ...this.arrParametrosConsulta.filtros,
        {
          operador: '__icontains',
          propiedad: 'id__icontains',
          valor1: this.formularioFiltros.get('id').value,
        },
        {
          operador: '__icontains',
          propiedad: 'guia__icontains',
          valor1: this.formularioFiltros.get('guia').value,
        },
      ],
    };

    if (estadoDecodificado !== "todos") {
      parametrosConsulta.filtros = [
        ...parametrosConsulta.filtros,
        {
          operador: '',
          propiedad: 'estado_decodificado',
          valor1: estadoDecodificado === 'si',
        },
      ];
    }

    this.consultaLista(parametrosConsulta);
  }

  limpiarFiltros() {
    this.consultaLista(this.arrParametrosConsulta);
    this.formularioFiltros.patchValue({
      id: '',
      guia: '',
      estado_decodificado: 'todos',
    });
  }
}
