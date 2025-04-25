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
import { InputComponent } from '../../../../common/components/ui/form/input/input.component';
import { LabelComponent } from '../../../../common/components/ui/form/label/label.component';
import { SwitchComponent } from '../../../../common/components/ui/form/switch/switch.component';
import { GeneralService } from '../../../../common/services/general.service';
import { DespachoDetalle } from '../../../../interfaces/despacho/despacho.interface';
import { ParametrosConsulta } from '../../../../interfaces/general/api.interface';
import {
  Vehiculo
} from '../../../../interfaces/vehiculo/vehiculo.interface';

@Component({
  selector: 'app-despacho-formulario',
  standalone: true,
  imports: [
    CommonModule,
    ButtonComponent,
    ReactiveFormsModule,
    LabelComponent,
    NgSelectModule,
  ],
  templateUrl: './despacho-formulario.component.html',
  styleUrl: './despacho-formulario.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class DespachoFormularioComponent extends General {
  private _generalService = inject(GeneralService);

  public vehiculos = signal<Vehiculo[]>([]);

  @Input() isEditando: boolean;
  @Input() despacho: DespachoDetalle;

  @Output() emitirFormulario: EventEmitter<any> = new EventEmitter();

  public despachoForm = new FormGroup({
    fecha: new FormControl<string>('', [Validators.required]),
    fecha_salida: new FormControl<string>('', [Validators.required]),
    fecha_ubicacion: new FormControl<any>(null),
    peso: new FormControl<number>(0, [Validators.required, Validators.min(0)]),
    volumen: new FormControl<number>(0, [
      Validators.required,
      Validators.min(0),
    ]),
    tiempo: new FormControl<number>(0, [
      Validators.required,
      Validators.min(0),
    ]),
    tiempo_servicio: new FormControl<number>(0, [
      Validators.required,
      Validators.min(0),
    ]),
    tiempo_trayecto: new FormControl<number>(0, [
      Validators.required,
      Validators.min(0),
    ]),
    visitas: new FormControl<number>(0, [
      Validators.required,
      Validators.min(0),
    ]),
    visitas_entregadas: new FormControl<number>(0, [
      Validators.required,
      Validators.min(0),
    ]),
    visitas_liberadas: new FormControl<number>(0, [
      Validators.required,
      Validators.min(0),
    ]),
    vehiculo: new FormControl<number>(0, [Validators.required]),
    vehiculo_placa: new FormControl<string>('', [
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(10),
    ]),
    entrega_id: new FormControl<number>(0, [Validators.required]),
    estado_aprobado: new FormControl<boolean>(false),
    estado_terminado: new FormControl<boolean>(false),
  });

  ngOnInit(): void {
    if (this.isEditando) {
      this._initValoresFormulario();
      this.getVehiculoByPlaca(this.despachoForm.get('vehiculo_placa').value);
    }
  }

  getVehiculoByPlaca(placa: string) {
    let filtros = {
      filtros: [
        {
          operador: 'icontains',
          propiedad: 'placa',
          valor1: placa,
        },
      ],
      limite: 10,
      desplazar: 0,
      ordenamientos: [],
      limite_conteo: 10000,
      modelo: 'RutVehiculo',
    };

    this.getVehiculos(filtros).subscribe((response) => {
      this.vehiculos.set(response.registros);
    });
  }

  getVehiculos(filtros?: ParametrosConsulta) {
    return this._generalService.autocompletar<Vehiculo>(filtros);
  }

  private _initValoresFormulario() {
    this.despachoForm.setValue({
      fecha: this.despacho.fecha,
      fecha_salida: this.despacho.fecha_salida,
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
      entrega_id: this.despacho.entrega_id,
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
