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
import {
  FormArray,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { LabelComponent } from '../../../../../../common/components/ui/form/label/label.component';
import { VehiculoService } from '../../../../../vehiculo/servicios/vehiculo.service';
import { General } from '../../../../../../common/clases/general';
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
import { ListaVehiculo } from '../../../../../../interfaces/vehiculo/vehiculo.interface';
import { ParametrosConsulta } from '../../../../../../interfaces/general/api.interface';
import { ButtonComponent } from '../../../../../../common/components/ui/button/button.component';
import { FlotaService } from '../../../../../flota/servicios/flota.service';
import { KTModal } from '../../../../../../../metronic/core';

@Component({
  selector: 'app-agregar-flota',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgSelectModule,
    LabelComponent,
    ButtonComponent,
  ],
  templateUrl: './agregar-flota.component.html',
  styleUrl: './agregar-flota.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AgregarFlotaComponent extends General implements OnInit {
  @Input() itemsSeleccionados: number[] = [];
  @Output() emitirConsultarLista: EventEmitter<void>;
  private _vehiculoService = inject(VehiculoService);
  private _flotaService = inject(FlotaService);
  public vehiculosDisponibles$: Observable<ListaVehiculo[]>;
  public textoBusqueda = new FormControl();
  private _vehiculosIds: number[] = [];
  private _parametrosConsulta: ParametrosConsulta = {
    filtros: [],
    limite: 50,
    desplazar: 0,
    ordenamientos: [],
    limite_conteo: 10000,
    modelo: 'RutVehiculo',
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

    this._initBusqueda();
  }

  private _limpiarVehiculosSeleccionados() {
    this._vehiculosIds = [];
  }

  private _initBusqueda() {
    this.textoBusqueda.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((busqueda) => {
          const parametrosConsulta = {
            ...this._parametrosConsulta,
            filtros: [
              {
                operador: 'icontains',
                propiedad: 'placa',
                valor1: busqueda,
              },
            ],
          };

          return this._vehiculoService
            .lista(parametrosConsulta)
            .pipe(map((response) => response.registros));
        })
      )
      .subscribe((response) => {
        this.vehiculosDisponibles$ = of(response);
        this._limpiarVehiculosSeleccionados();
        this.changeDetectorRef.detectChanges();
      });
  }

  estoyEnListaEliminar(id: number): boolean {
    return this._vehiculosIds.indexOf(id) !== -1;
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

    console.log(this._vehiculosIds);
  }

  private _agregarItemAListaEliminar(id: number) {
    this._vehiculosIds.push(id);
  }

  private _removerItemDeListaEliminar(id: number) {
    const itemsFiltrados = this._vehiculosIds.filter((item) => item !== id);
    this._vehiculosIds = itemsFiltrados;
  }

  private _removerTodosLosItemsAListaEliminar() {
    this._vehiculosIds = [];
  }

  private _agregarTodosLosItemsAListaEliminar() {
    this.vehiculosDisponibles$.subscribe((response) => {
      response.forEach((item) => {
        const indexItem = this._vehiculosIds.indexOf(item.id);

        if (indexItem === -1) {
          this._vehiculosIds.push(item.id);
        }
      });

      console.log(this._vehiculosIds);
      this.changeDetectorRef.detectChanges();
    });
  }

  private _consultarVehiculos() {
    this.vehiculosDisponibles$ = this._vehiculoService
      .lista(this._parametrosConsulta)
      .pipe(map((response) => response.registros));
  }

  get flota() {
    return this.formularioFlota.get('flota');
  }

  get vehiculosIds() {
    return this._vehiculosIds;
  }

  enviar() {
    const agregarFlotas = this.vehiculosIds.map((id) => {
      return this._flotaService.agregarFlota(id);
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
