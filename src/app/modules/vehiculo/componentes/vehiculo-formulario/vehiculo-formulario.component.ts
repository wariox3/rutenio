import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { General } from '../../../../common/clases/general';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonComponent } from "../../../../common/components/ui/button/button.component";
import { RouterLink } from '@angular/router';
import { InputComponent } from "../../../../common/components/ui/form/input/input.component";
import { SwitchComponent } from "../../../../common/components/ui/form/switch/switch.component";

@Component({
  selector: 'app-vehiculo-formulario',
  standalone: true,
  imports: [
    CommonModule,
    ButtonComponent,
    ReactiveFormsModule,
    RouterLink,
    InputComponent,
    SwitchComponent
],
  templateUrl: './vehiculo-formulario.component.html',
  styleUrl: './vehiculo-formulario.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class VehiculoFormularioComponent extends General { 

  @Input() informacionVehiculo: any;
  @Output() dataFormulario: EventEmitter<any> = new EventEmitter();


  public formularioVehiculo= new FormGroup({
    placa: new FormControl(
      '',
      Validators.compose([
        Validators.required,
        Validators.maxLength(6),
      ])
    ),
    capacidad: new FormControl(
      '',
      Validators.compose([
        Validators.required,
        Validators.pattern("^[0-9]*$"),
      ])
    ),
    estado_activo: new FormControl(true),
  });

  enviar() {
    if (this.formularioVehiculo.valid) {
      return this.dataFormulario.emit(this.formularioVehiculo.value);
    } else {
      this.formularioVehiculo.markAllAsTouched();
    }
  }

}
