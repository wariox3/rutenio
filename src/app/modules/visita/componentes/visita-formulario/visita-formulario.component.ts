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

@Component({
  selector: 'app-visita-formulario',
  standalone: true,
  imports: [
    CommonModule,
    ButtonComponent,
    ReactiveFormsModule,
    RouterLink,
    InputComponent,
    SwitchComponent,
  ],
  template: `<p>visita-formulario works!</p>`,
  styleUrl: './visita-formulario.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class VisitaFormularioComponent
  extends General
  implements OnInit
{
  @Input() informacionVisita: any;
  @Input({ required: true }) formularioTipo: 'editar' | 'crear';
  @Output() dataFormulario: EventEmitter<any> = new EventEmitter();

  public formularioVisita = new FormGroup({
    fecha: new FormControl(''),
    documento: new FormControl(''),
    destinatario: new FormControl(''),
    destinatario_direccion: new FormControl(''),
    destinatario_telefono: new FormControl(''),
    destinatario_correo: new FormControl(''),
    peso: new FormControl(''),
    volumen: new FormControl(''),
    latitud: new FormControl(''),
    longitud: new FormControl(''),
    decodificado: new FormControl(false),
  });

  ngOnInit(): void {
    if (this.formularioTipo === 'editar') {
      this.formularioVisita.patchValue({
        fecha: this.informacionVisita.fecha,
        documento: this.informacionVisita.documento,
        destinatario: this.informacionVisita.destinatario,
        destinatario_direccion: this.informacionVisita.destinatario_direccion,
        destinatario_telefono: this.informacionVisita.destinatario_telefono,
      });
    }
  }

  enviar() {
    if (this.formularioVisita.valid) {
      return this.dataFormulario.emit(this.formularioVisita.value);
    } else {
      this.formularioVisita.markAllAsTouched();
    }
  }
}
