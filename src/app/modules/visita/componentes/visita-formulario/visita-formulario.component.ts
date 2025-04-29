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
import { InputEmailComponent } from "../../../../common/components/ui/form/input-email/input-email.component";
import { LabelComponent } from "../../../../common/components/ui/form/label/label.component";

@Component({
  selector: 'app-visita-formulario',
  standalone: true,
  imports: [
    CommonModule,
    ButtonComponent,
    ReactiveFormsModule,
    RouterLink,
    InputComponent,
    InputEmailComponent,
    LabelComponent
],
  templateUrl: 'visita-formulario.component.html',
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
    numero: new FormControl('', [Validators.required]),
    documento: new FormControl(null),
    destinatario: new FormControl('', [Validators.required]),
    destinatario_direccion: new FormControl('', [Validators.required]),
    destinatario_telefono: new FormControl(null),
    destinatario_correo: new FormControl(null),
    peso: new FormControl('', [Validators.required]),
    volumen: new FormControl('', [Validators.required]),
  });

  ngOnInit(): void {
    if (this.formularioTipo === 'editar') {
      this.formularioVisita.patchValue({
        numero: this.informacionVisita.numero,
        documento: this.informacionVisita.documento,
        destinatario: this.informacionVisita.destinatario,
        destinatario_direccion: this.informacionVisita.destinatario_direccion,
        destinatario_telefono: this.informacionVisita.destinatario_telefono,
        destinatario_correo: this.informacionVisita.destinatario_correo,
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
