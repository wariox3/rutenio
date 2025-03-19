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
import { General } from '../../../../common/clases/general';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ButtonComponent } from '../../../../common/components/ui/button/button.component';
import { RouterLink } from '@angular/router';
import { InputComponent } from '../../../../common/components/ui/form/input/input.component';
import { SwitchComponent } from '../../../../common/components/ui/form/switch/switch.component';
import { map } from 'rxjs';
import { GeneralService } from '../../../../common/services/general.service';
import { AutocompletarFranja } from '../../../../interfaces/general/autocompletar.interface';
import { LabelComponent } from '../../../../common/components/ui/form/label/label.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { InputEmailComponent } from '../../../../common/components/ui/form/input-email/input-email.component';
import { cambiarVacioPorNulo } from '../../../../common/validaciones/campo-no-obligatorio.validator';

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
    InputEmailComponent,
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

  public franjaOpciones: AutocompletarFranja[];
  public formularioVehiculo = new FormGroup({
    franja_codigo: new FormControl(
      null,
      cambiarVacioPorNulo.validar
    ),
    placa: new FormControl(
      '',
      Validators.compose([Validators.required, Validators.maxLength(6)])
    ),
    capacidad: new FormControl(
      '',
      Validators.compose([Validators.required, Validators.pattern('^[0-9]*$')])
    ),
    estado_activo: new FormControl(true),
    tiempo: new FormControl(0),
    estado_asignado: new FormControl(false),
    usuario_app: new FormControl(null, [
      Validators.maxLength(255),
      Validators.email,
      cambiarVacioPorNulo.validar,
    ]),
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
        this.franjaOpciones = response.registros;
        this.changeDetectorRef.detectChanges();
      });
  }

  enviar() {
    if (this.formularioVehiculo.valid) {
      return this.dataFormulario.emit(this.formularioVehiculo.value);
    } else {
      this.formularioVehiculo.markAllAsTouched();
    }
  }
}
