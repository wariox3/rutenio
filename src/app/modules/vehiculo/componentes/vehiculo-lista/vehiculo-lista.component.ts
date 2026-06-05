import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { finalize, Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { General } from '../../../../common/clases/general';
import { FileUploadComponent } from '../../../../common/components/file-upload/file-upload.component';
import { ButtonComponent } from '../../../../common/components/ui/button/button.component';
import { ModalStandardComponent } from '../../../../common/components/ui/modals/modal-standard/modal-standard.component';
import { ModalService } from '../../../../common/components/ui/modals/service/modal.service';
import { TablaComunComponent } from '../../../../common/components/ui/tablas/tabla-comun/tabla-comun.component';
import { mapeo } from '../../../../common/mapeos/administradores';
import { GeneralApiService } from '../../../../core';
import { EstadoPaginacion, ParametrosApi, RespuestaApi } from '../../../../core/types/api.type';
import { ParametrosConsulta } from '../../../../interfaces/general/api.interface';
import { ListaVehiculo } from '../../../../interfaces/vehiculo/vehiculo.interface';
import { VehiculoService } from '../../servicios/vehiculo.service';
import { PaginadorComponent } from "../../../../common/components/ui/paginacion/paginador/paginador.component";
import { ImportarComponent } from "../../../../common/components/importar/importar.component";
import { PermisoPorDirective } from '../../../../common/directivas/permiso-por.directive';

@Component({
  selector: 'app-vehiculo-lista',
  standalone: true,
  imports: [
    CommonModule,
    ButtonComponent,
    RouterLink,
    TablaComunComponent,
    ModalStandardComponent,
    FileUploadComponent,
    FormsModule,
    PaginadorComponent,
    ImportarComponent,
    PermisoPorDirective,
],
  templateUrl: './vehiculo-lista.component.html',
  styleUrl: './vehiculo-lista.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class VehiculoListaComponent extends General implements OnInit, OnDestroy {
  arrParametrosConsulta: ParametrosConsulta = {
    filtros: [],
    limite: 50,
    desplazar: 0,
    ordenamientos: [],
    limite_conteo: 10000,
    modelo: 'RutVehiculo',
  };
  cantidad_registros!: number;
  arrVehiculos: ListaVehiculo[];
  encabezados: any[];
  public mapeoAdministrador = mapeo;
  private _listaItemsEliminar: number[] = [];
  private _filtrosActivos = signal<ParametrosApi>({});

  public busquedaPlaca = '';
  public estadoFiltro: 'todos' | 'activo' | 'inactivo' = 'todos';
  private _busquedaPlaca$ = new Subject<string>();
  private _destroy$ = new Subject<void>();

  private vehiculoService = inject(VehiculoService);
  private _modalService = inject(ModalService);
  private _generalApiService = inject(GeneralApiService);
  public estadoPaginacion = signal<EstadoPaginacion>({
    paginaActual: 1,
    itemsPorPagina: 30,
    totalItems: 0,
  });

  ngOnInit(): void {
    this._busquedaPlaca$
      .pipe(debounceTime(350), distinctUntilChanged(), takeUntil(this._destroy$))
      .subscribe(() => this.aplicarBusqueda());

    this.consultarLista();

    this.encabezados = mapeo.Vehiculo.datos
      .filter((dato) => dato.visibleTabla === true)
      .map((dato) => dato.nombre);
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  consultarLista() {

    const parametros: ParametrosApi = {
      page: this.estadoPaginacion().paginaActual,
      ...this._filtrosActivos(),
    };

    this._generalApiService
      .consultaApi<RespuestaApi<ListaVehiculo>>('ruteo/vehiculo/', parametros)
      .subscribe((respuesta) => {
        this.actualizarPaginacion(respuesta.count);
        this.arrVehiculos = respuesta.results;
        this.changeDetectorRef.detectChanges();
      });
  }

  editarVehiculo(id: number) {
    this.router.navigateByUrl(`/administracion/vehiculo/editar/${id}`);
  }

  detalleVehiculo(id: number) {
    this.router.navigateByUrl(`/administracion/vehiculo/detalle/${id}`);
  }

  actualizarItemsSeleccionados(items: any[]) {
    this._listaItemsEliminar = items;
  }

  async eliminarItemsSeleccionados() {
    if (this._listaItemsEliminar.length === 0) {
      return;
    }

    const cantidadVehiculos = this._listaItemsEliminar.length;
    const textoConfirmacion = cantidadVehiculos === 1 
      ? '¿Estás seguro de que deseas eliminar este vehículo?' 
      : `¿Estás seguro de que deseas eliminar estos ${cantidadVehiculos} vehículos?`;

    const resultado = await this.alerta.confirmar({
      titulo: 'Confirmar eliminación',
      texto: textoConfirmacion,
      textoBotonCofirmacion: 'Sí, eliminar',
      colorConfirmar: '#d33'
    });

    if (resultado.isConfirmed) {
      this.vehiculoService
        .eliminarVehiculos(this._listaItemsEliminar)
        .pipe(
          finalize(() => {
            this._listaItemsEliminar = [];
            this.consultarLista();
            this.changeDetectorRef.detectChanges();
          })
        )
        .subscribe({
          next: () => {
            this.alerta.mensajaExitoso('Se han eliminado los registros');
          },
          error: (error) => {
            this.alerta.mensajeError(
              'Error al eliminar',
              'No se han eliminado algunos de los registros'
            );
          },
        });
    }
  }

  abrirModal(id: string) {
    this._modalService.open(id);
  }

  getModalInstaceState(id: string): Observable<boolean> {
    return this._modalService.isOpen$(id);
  }

  cerrarModal(id: string) {
    this._modalService.close(id);
  }

  handleUploadSuccess(event: any) {
    this.alerta.mensajaExitoso('Se importaron los vehículos correctamente');
    this.cerrarModal('importarVehiculos');
    this.consultarLista();
  }

  handleUploadError(event: any) {
    this.alerta.mensajeError('Error al importar vehículos', event.error);
  }

  onBusquedaPlacaChange(valor: string) {
    this.busquedaPlaca = valor;
    this._busquedaPlaca$.next((valor || '').trim());
  }

  onEstadoChange(estado: 'todos' | 'activo' | 'inactivo') {
    this.estadoFiltro = estado;
    this.aplicarBusqueda();
  }

  limpiarBusqueda() {
    this.busquedaPlaca = '';
    this.estadoFiltro = 'todos';
    this.aplicarBusqueda();
  }

  get hayBusquedaActiva(): boolean {
    return this.busquedaPlaca.trim() !== '' || this.estadoFiltro !== 'todos';
  }

  private aplicarBusqueda() {
    const filtros: ParametrosApi = {};
    const placa = this.busquedaPlaca.trim();
    if (placa) {
      filtros['placa__icontains'] = placa;
    }
    if (this.estadoFiltro === 'activo') {
      filtros['estado_activo'] = 'True';
    } else if (this.estadoFiltro === 'inactivo') {
      filtros['estado_activo'] = 'False';
    }

    this._filtrosActivos.set(filtros);
    this.estadoPaginacion.update((estado) => ({
      ...estado,
      paginaActual: 1,
    }));

    this.consultarLista();
  }

  onPageChange(nuevaPagina: number): void {
    this.estadoPaginacion.update(estado => ({
      ...estado,
      paginaActual: nuevaPagina,
    }));

    this.consultarLista();
  }

  private actualizarPaginacion(count: number) {
    this.estadoPaginacion.update(estado => ({
      ...estado,
      totalItems: count,
      totalPaginas: Math.ceil(count / estado.itemsPorPagina),
    }));
  }
}
