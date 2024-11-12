import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
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

  public formularioVehiculo = new FormGroup({
    placa: new FormControl(
      '',
      Validators.compose([Validators.required, Validators.maxLength(6)])
    ),
    capacidad: new FormControl(
      '',
      Validators.compose([Validators.required, Validators.pattern('^[0-9]*$')])
    ),
    estado_activo: new FormControl(true),
    estado_asignado: new FormControl(false),
  });

  ngOnInit(): void {
    if (this.formularioTipo === 'editar') {
      this.formularioVehiculo.patchValue({
        placa: this.informacionVehiculo.placa,
        capacidad: this.informacionVehiculo.capacidad,
        estado_activo: this.informacionVehiculo.estado_activo,
        estado_asignado: this.informacionVehiculo.estado_asignado,
      });
    }

    this.formularioVehiculo
      .get('placa')
      ?.valueChanges.pipe(map((value: string) => value.toUpperCase()))
      .subscribe((value: string) => {
        this.formularioVehiculo
          .get('placa')
          ?.setValue(value, { emitEvent: false });
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
