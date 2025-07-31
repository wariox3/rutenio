import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import {
  debounceTime,
  distinctUntilChanged,
  finalize,
  forkJoin,
  map,
  Observable,
  of,
  switchMap,
} from 'rxjs';
import { KTModal } from '../../../../../../../metronic/core';
import { General } from '../../../../../../common/clases/general';
import { ButtonComponent } from '../../../../../../common/components/ui/button/button.component';
import { ParametrosConsulta } from '../../../../../../interfaces/general/api.interface';
import { ListaVehiculo } from '../../../../../../interfaces/vehiculo/vehiculo.interface';
import { FlotaService } from '../../../../../flota/servicios/flota.service';
import { VehiculoService } from '../../../../../vehiculo/servicios/vehiculo.service';
import { ParametrosApi, RespuestaApi } from '../../../../../../core/types/api.type';
import { GeneralApiService } from '../../../../../../core';

@Component({
  selector: 'app-agregar-flota',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgSelectModule, ButtonComponent],
  templateUrl: './agregar-flota.component.html',
  styleUrl: './agregar-flota.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AgregarFlotaComponent extends General implements OnInit {
  @Input() itemsSeleccionados: number[] = [];
  @Output() emitirConsultarLista: EventEmitter<void>;
  private _vehiculoService = inject(VehiculoService);
  private _generalApiService = inject(GeneralApiService);
  private _flotaService = inject(FlotaService);
  public vehiculosDisponibles$: Observable<ListaVehiculo[]>;
  public textoBusqueda = new FormControl();
  private _vehiculosSeleccionados: { id: number }[] = [];
  private _parametrosConsulta: ParametrosApi = {
    estado_activo: 'True'

    // filtros: [
    //   { propiedad: 'estado_activo', operador: 'exact', valor1: true },
    // ],
    // limite: 50,
    // desplazar: 0,
    // ordenamientos: [],
    // limite_conteo: 10000,
    // modelo: 'RutVehiculo',
  };

  formularioFlota: FormGroup = new FormGroup({
    flota: new FormControl(),
  });

  constructor() {
    super();
    this.vehiculosDisponibles$ = new Observable();
    this.emitirConsultarLista = new EventEmitter();
  }

  ngOnInit(): void {
    this._consultarVehiculos();
    this.formularioFlota.patchValue({
      flota: this.itemsSeleccionados,
    });

    // Inicializar los items ya seleccionados con sus prioridades
    this.itemsSeleccionados.forEach((id) => {
      this._vehiculosSeleccionados.push({ id });
    });

    this._initBusqueda();
  }

  private _limpiarVehiculosSeleccionados() {
    this._vehiculosSeleccionados = [];
  }

  private _initBusqueda() {
    this.textoBusqueda.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((busqueda) => {
          const parametrosConsulta = {
              ...this._parametrosConsulta,
              placa_icontains : busqueda
          };

          return this._generalApiService
            .consultaApi<RespuestaApi<any>>('ruteo/vehiculo/', parametrosConsulta)
            .pipe(map((response) => response.results));
        })
      )
      .subscribe((response) => {
        this.vehiculosDisponibles$ = of(response);
        this._limpiarVehiculosSeleccionados();
        this.changeDetectorRef.detectChanges();
      });
  }

  estoyEnListaEliminar(id: number): boolean {
    return this._vehiculosSeleccionados.some(v => v.id === id);
  }

  manejarCheckGlobal(event: any) {
    if (event.target.checked) {
      this._agregarTodosLosItemsAListaEliminar();
    } else {
      this._removerTodosLosItemsAListaEliminar();
    }
  }

  manejarCheckItem(event: any, id: number) {
    if (event.target.checked) {
      this._agregarItemAListaEliminar(id);
    } else {
      this._removerItemDeListaEliminar(id);
    }
  }

  private _agregarItemAListaEliminar(id: number) {
    this._vehiculosSeleccionados.push({ id });
  }

  private _removerItemDeListaEliminar(id: number) {
    this._vehiculosSeleccionados = this._vehiculosSeleccionados
      .filter(item => item.id !== id)
      .map((item) => ({ ...item }));
  }

  private _removerTodosLosItemsAListaEliminar() {
    this._vehiculosSeleccionados = [
      ...this.itemsSeleccionados.map((id) => ({ id })),
    ];
  }

  isVehiculoAsignadoFlota(vehiculoId: number) {
    return this.itemsSeleccionados.some((itemId) => itemId === vehiculoId);
  }

  private _agregarTodosLosItemsAListaEliminar() {
    this.vehiculosDisponibles$.subscribe((response) => {
      response.forEach((item) => {
        const isVehiculoAsignado = this.isVehiculoAsignadoFlota(item.id);

        if (!this.estoyEnListaEliminar(item.id) && !isVehiculoAsignado) {
          this._agregarItemAListaEliminar(item.id);
        }
      });

      this.changeDetectorRef.detectChanges();
    });
  }

  private _consultarVehiculos() {
    this.vehiculosDisponibles$ = this._generalApiService
      .consultaApi<RespuestaApi<any>>('ruteo/vehiculo/',this._parametrosConsulta)
      .pipe(
        map((response) => {
          return response.results;
        })
      );
  }

  get flota() {
    return this.formularioFlota.get('flota');
  }

  get vehiculosIds() {
    return this._vehiculosSeleccionados.map(v => v.id);
  }

  enviar() {
    // Filtrar solo los vehículos nuevos (los que no estaban en itemsSeleccionados)
    const nuevosVehiculos = this._vehiculosSeleccionados
      .filter(item => !this.itemsSeleccionados.includes(item.id));

    if (nuevosVehiculos.length === 0) {
      this._dismissModal();
      return;
    }

    const agregarFlotas = nuevosVehiculos.map((item) => {
      return this._flotaService.agregarFlota(item.id);
    });

    forkJoin(agregarFlotas)
      .pipe(
        finalize(() => {
          this.emitirConsultarLista.emit();
          this._dismissModal();
        })
      )
      .subscribe(() => {
        this.alerta.mensajaExitoso('Flotas agregadas');
      });
  }

  private _dismissModal() {
    const modalEl: HTMLElement = document.querySelector('#agregar-flota');
    const modal = KTModal.getInstance(modalEl);

    modal.toggle();
  }
}
