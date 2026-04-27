import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { finalize, forkJoin, tap } from 'rxjs';
import { KTModal } from '../../../../../../../metronic/core';
import { General } from '../../../../../../common/clases/general';
import { SoloNumerosDirective } from '../../../../../../common/directivas/solo-numeros.directive';
import { ListaFlota } from '../../../../../../interfaces/flota/flota.interface';
import {
  ListaFranja,
  ListaVehiculo,
} from '../../../../../../interfaces/vehiculo/vehiculo.interface';
import { FlotaService } from '../../../../../flota/servicios/flota.service';
import { ParametrosApi, RespuestaApi } from '../../../../../../core/types/api.type';
import { GeneralApiService } from '../../../../../../core';

@Component({
  selector: 'app-agregar-flota',
  standalone: true,
  imports: [CommonModule, FormsModule, NgSelectModule, SoloNumerosDirective],
  templateUrl: './agregar-flota.component.html',
  styleUrl: './agregar-flota.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AgregarFlotaComponent
  extends General
  implements OnInit, OnChanges
{
  @Input() flotaActual: ListaFlota[] = [];
  @Output() emitirConsultarLista: EventEmitter<void>;
  @Output() emitirEliminarFlota = new EventEmitter<number>();
  @Output() emitirActualizarPrioridad = new EventEmitter<{
    flota: ListaFlota;
    prioridad: number;
  }>();

  private _generalApiService = inject(GeneralApiService);
  private _flotaService = inject(FlotaService);

  public vehiculosDisponibles: ListaVehiculo[] = [];
  public vehiculosSeleccionados: number[] = [];
  public franjasDisponibles: ListaFranja[] = [];
  public franjaFiltro: number | null = null;
  public cargando = false;
  public guardando = false;

  private _parametrosConsulta: ParametrosApi = {
    estado_activo: 'True',
  };

  constructor() {
    super();
    this.emitirConsultarLista = new EventEmitter();
  }

  ngOnInit(): void {
    this._consultarVehiculos();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['flotaActual'] && !changes['flotaActual'].firstChange) {
      const ids = this.idsEnFlota;
      this.vehiculosSeleccionados = this.vehiculosSeleccionados.filter(
        (id) => !ids.includes(id)
      );
      this.changeDetectorRef.detectChanges();
    }
  }

  get idsEnFlota(): number[] {
    return this.flotaActual.map((f) => f.vehiculo_id);
  }

  get capacidadDisponible(): number {
    return this.flotaActual
      .filter((f) => !f.vehiculo_estado_asignado)
      .reduce((sum, f) => sum + (f.vehiculo_capacidad || 0), 0);
  }

  get tiempoDisponible(): number {
    return this.flotaActual
      .filter((f) => !f.vehiculo_estado_asignado)
      .reduce((sum, f) => sum + (f.vehiculo_tiempo || 0), 0);
  }

  get vehiculosFiltrados(): ListaVehiculo[] {
    const ids = this.idsEnFlota;
    let lista = this.vehiculosDisponibles.filter((v) => !ids.includes(v.id));
    if (this.franjaFiltro !== null) {
      lista = lista.filter((v) =>
        v.franjas?.some((f) => f.id === this.franjaFiltro)
      );
    }
    return lista;
  }

  filtrarPorFranja(franjaId: number | null) {
    this.franjaFiltro = franjaId;
  }

  agregar() {
    if (this.vehiculosSeleccionados.length === 0 || this.guardando) {
      return;
    }

    this.guardando = true;
    const peticiones = this.vehiculosSeleccionados.map((id) =>
      this._flotaService.agregarFlota(id)
    );

    forkJoin(peticiones)
      .pipe(
        finalize(() => {
          this.guardando = false;
          this.changeDetectorRef.detectChanges();
        })
      )
      .subscribe(() => {
        this.alerta.mensajaExitoso('Flota actualizada');
        this.vehiculosSeleccionados = [];
        this.emitirConsultarLista.emit();
      });
  }

  eliminar(flotaId: number) {
    this.emitirEliminarFlota.emit(flotaId);
  }

  actualizarPrioridad(event: Event, flota: ListaFlota) {
    const valor = (event.target as HTMLInputElement).value;
    if (!valor || flota.prioridad === Number(valor)) {
      return;
    }
    this.emitirActualizarPrioridad.emit({ flota, prioridad: Number(valor) });
  }

  cerrar() {
    this._dismissModal();
  }

  private _consultarVehiculos() {
    this.cargando = true;
    this._generalApiService
      .consultaApi<RespuestaApi<ListaVehiculo>>(
        'ruteo/vehiculo/',
        this._parametrosConsulta
      )
      .pipe(tap(() => (this.cargando = false)))
      .subscribe((response) => {
        this.vehiculosDisponibles = response.results;
        this.franjasDisponibles = this._extraerFranjasUnicas(
          this.vehiculosDisponibles
        );
        this.changeDetectorRef.detectChanges();
      });
  }

  private _extraerFranjasUnicas(vehiculos: ListaVehiculo[]): ListaFranja[] {
    const mapa = new Map<number, ListaFranja>();
    vehiculos.forEach((v) =>
      v.franjas?.forEach((f) => {
        if (!mapa.has(f.id)) mapa.set(f.id, f);
      })
    );
    return Array.from(mapa.values());
  }

  private _dismissModal() {
    const modalEl: HTMLElement = document.querySelector('#agregar-flota');
    const modal = KTModal.getInstance(modalEl);
    modal.toggle();
  }
}
