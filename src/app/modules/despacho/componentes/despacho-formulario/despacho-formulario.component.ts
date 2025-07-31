import { RespuestaApi } from './../../../../core/types/api.type';
import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  inject,
  Input,
  Output,
  signal,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { General } from '../../../../common/clases/general';
import { ButtonComponent } from '../../../../common/components/ui/button/button.component';
import { LabelComponent } from '../../../../common/components/ui/form/label/label.component';
import { GeneralService } from '../../../../common/services/general.service';
import {
  Despacho,
  DespachoDetalle,
} from '../../../../interfaces/despacho/despacho.interface';
import { ParametrosConsulta } from '../../../../interfaces/general/api.interface';
import { Vehiculo } from '../../../../interfaces/vehiculo/vehiculo.interface';
import { RouterLink } from '@angular/router';
import { FechasService } from '../../../../common/services/fechas.service';
import { ParametrosApi } from '../../../../core/types/api.type';

@Component({
  selector: 'app-despacho-formulario',
  standalone: true,
  imports: [
    CommonModule,
    ButtonComponent,
    ReactiveFormsModule,
    LabelComponent,
    RouterLink,
    NgSelectModule,
  ],
  templateUrl: './despacho-formulario.component.html',
  styleUrl: './despacho-formulario.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class DespachoFormularioComponent extends General {
  private _generalService = inject(GeneralService);
  private _fechaService = inject(FechasService);

  public vehiculos = signal<Vehiculo[]>([]);

  @Input() isEditando: boolean;
  @Input() isModal: boolean;
  @Input() isAprobado: boolean = false;
  @Input() despacho: DespachoDetalle | Despacho;

  @Output() emitirFormulario: EventEmitter<any> = new EventEmitter();

  public despachoForm = new FormGroup({
    fecha: new FormControl<string>(
      this._fechaService.getFechaVencimientoInicial(),
      []
    ),
    fecha_ubicacion: new FormControl<any>(null),
    peso: new FormControl<number>(0, [Validators.min(0)]),
    volumen: new FormControl<number>(0, [Validators.min(0)]),
    tiempo: new FormControl<number>(0, [Validators.min(0)]),
    tiempo_servicio: new FormControl<number>(0, [Validators.min(0)]),
    tiempo_trayecto: new FormControl<number>(0, [Validators.min(0)]),
    visitas: new FormControl<number>(0, [Validators.min(0)]),
    visitas_entregadas: new FormControl<number>(0, [Validators.min(0)]),
    visitas_liberadas: new FormControl<number>(0, [Validators.min(0)]),
    vehiculo: new FormControl<number>(0, [Validators.required]),
    vehiculo_placa: new FormControl<string>('', [
      Validators.minLength(3),
      Validators.maxLength(10),
    ]),
    estado_aprobado: new FormControl<boolean>(false),
    estado_terminado: new FormControl<boolean>(false),
  });

  ngOnInit(): void {
    if (this.isEditando) {
      this._initValoresFormulario();
      this.getVehiculoByPlaca(this.despachoForm.get('vehiculo_placa').value);
    } else {
      this.despachoForm.patchValue({
        estado_aprobado: this.isAprobado
      });
      this.getVehiculoByPlaca('');
    }
  }

  getVehiculoByPlaca(placa: string) {
    let filtros = {
      estado_activo: 'True',
      'placa_icontains': placa,
      limit: 10,
    };

    this.getVehiculos(filtros).subscribe((response) => {
      this.vehiculos.set(response.results);
    });
  }

  getVehiculos(filtros?: ParametrosApi) {
    return this._generalService.consultaApi<RespuestaApi<Vehiculo>>('ruteo/vehiculo/', filtros);
  }

  private _initValoresFormulario() {
    this.despachoForm.setValue({
      fecha: this.despacho.fecha,
      fecha_ubicacion: this.despacho.fecha_ubicacion,
      peso: this.despacho.peso,
      volumen: this.despacho.volumen,
      tiempo: this.despacho.tiempo,
      tiempo_servicio: this.despacho.tiempo_servicio,
      tiempo_trayecto: this.despacho.tiempo_trayecto,
      visitas: this.despacho.visitas,
      visitas_entregadas: this.despacho.visitas_entregadas,
      visitas_liberadas: this.despacho.visitas_liberadas,
      vehiculo: this.despacho.vehiculo_id,
      vehiculo_placa: this.despacho.vehiculo_placa,
      estado_aprobado: this.despacho.estado_aprobado,
      estado_terminado: this.despacho.estado_terminado,
    });
  }

  onSubmit() {
    this.emitirFormulario.emit(this.despachoForm.value);
  }

  seleccionarCiudad(vehiculo: Vehiculo) {
    if (!vehiculo) {
      this.getVehiculoByPlaca('');
      return;
    }
  }

  buscarCiudadPorNombre(event?: any) {
    const excludedKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
    if (excludedKeys.includes(event?.key)) {
      return;
    }
    const ciudadNombre = event?.target.value || '';
    this.getVehiculoByPlaca(ciudadNombre);
  }
}
