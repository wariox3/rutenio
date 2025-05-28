import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
  signal,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { map } from 'rxjs';
import { General } from '../../../../common/clases/general';
import { ButtonComponent } from '../../../../common/components/ui/button/button.component';
import { InputComponent } from '../../../../common/components/ui/form/input/input.component';
import { LabelComponent } from '../../../../common/components/ui/form/label/label.component';
import { SwitchComponent } from '../../../../common/components/ui/form/switch/switch.component';
import { GeneralService } from '../../../../common/services/general.service';
import { AutocompletarFranja } from '../../../../interfaces/general/autocompletar.interface';
import { MultiSelectComponent } from "../../../../common/components/ui/form/multi-select/multi-select.component";

@Component({
  selector: 'app-vehiculo-formulario',
  standalone: true,
  imports: [
    CommonModule,
    ButtonComponent,
    ReactiveFormsModule,
    RouterLink,
    InputComponent,
    SwitchComponent,
    LabelComponent,
    NgSelectModule,
    MultiSelectComponent
],
  templateUrl: './vehiculo-formulario.component.html',
  styleUrl: './vehiculo-formulario.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class VehiculoFormularioComponent
  extends General
  implements OnInit
{
  @Input() informacionVehiculo: any;
  @Input({ required: true }) formularioTipo: 'editar' | 'crear';
  @Output() dataFormulario: EventEmitter<any> = new EventEmitter();

  private readonly _generalService = inject(GeneralService);

  public franjaOpciones = signal<AutocompletarFranja[]>([]);
  public formularioVehiculo = new FormGroup({
    franja_codigo: new FormControl(null),
    placa: new FormControl(
      '',
      Validators.compose([Validators.required, Validators.maxLength(6)])
    ),
    capacidad: new FormControl(
      '',
      Validators.compose([Validators.required, Validators.pattern('^[0-9]*$')])
    ),
    estado_activo: new FormControl(true),
    tiempo: new FormControl(0, [Validators.required]),
    estado_asignado: new FormControl(false),
    usuario_app: new FormControl(null),
  });

  ngOnInit(): void {
    if (this.formularioTipo === 'editar') {
      this._poblarFormulario();
    }

    this._consultarEntidadesSelectores();
    this._transformarPlacaMayusculas();
  }

  private _poblarFormulario() {
    this.formularioVehiculo.patchValue({
      franja_codigo: this.informacionVehiculo.franja_codigo,
      placa: this.informacionVehiculo.placa,
      tiempo: this.informacionVehiculo.tiempo,
      capacidad: this.informacionVehiculo.capacidad,
      estado_activo: this.informacionVehiculo.estado_activo,
      estado_asignado: this.informacionVehiculo.estado_asignado,
      usuario_app: this.informacionVehiculo.usuario_app,
    });
  }

  private _transformarPlacaMayusculas() {
    this.formularioVehiculo
      .get('placa')
      ?.valueChanges.pipe(map((value: string) => value.toUpperCase()))
      .subscribe((value: string) => {
        this.formularioVehiculo
          .get('placa')
          ?.setValue(value, { emitEvent: false });
      });
  }

  private _consultarEntidadesSelectores() {
    this._consultarOpcionesFranjas();
  }

  private _consultarOpcionesFranjas() {
    this._generalService
      .listaAutocompletar<AutocompletarFranja>('RutFranja')
      .subscribe((response) => {
        this.franjaOpciones.set(response.registros);
        this.changeDetectorRef.detectChanges();
      });
  }

  enviar() {
    if (this.formularioVehiculo.valid) {
      const formValue = this.formularioVehiculo.value;
      const cleanedValue = Object.fromEntries(
        Object.entries(formValue).map(([key, value]) => [
          key,
          typeof value === 'string' && value.trim() === '' ? null : value,
        ])
      );
      return this.dataFormulario.emit(cleanedValue);
    } else {
      this.formularioVehiculo.markAllAsTouched();
    }
  }

  seleccionarEntidadMultiSelect(event: number[]) {
    this.formularioVehiculo.patchValue({
      franja_codigo: event,
    });
    // this.filtros.controls[index].patchValue({
    //   valor1: event,
    // });
  }
}
