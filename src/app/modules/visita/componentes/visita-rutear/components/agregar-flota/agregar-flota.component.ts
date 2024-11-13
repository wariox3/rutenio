import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Input,
  OnInit,
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
import { map, Observable } from 'rxjs';
import { ListaVehiculo } from '../../../../../../interfaces/vehiculo/vehiculo.interface';
import { ParametrosConsulta } from '../../../../../../interfaces/general/api.interface';
import { ButtonComponent } from '../../../../../../common/components/ui/button/button.component';
import { FlotaService } from '../../../../../flota/servicios/flota.service';

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
  private _vehiculoService = inject(VehiculoService);
  private _flotaService = inject(FlotaService);
  public vehiculosDisponibles$: Observable<ListaVehiculo[]>;
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
  }

  ngOnInit(): void {
    this._consultarVehiculos();
    this.formularioFlota.patchValue({
      flota: this.itemsSeleccionados,
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

  enviar() {
    console.log(this.flota.value);

    this._flotaService.agregarFlota(this.flota.value[0]).subscribe();
  }
}
