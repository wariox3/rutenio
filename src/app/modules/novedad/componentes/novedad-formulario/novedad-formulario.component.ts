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
} from '@angular/forms';
import { ButtonComponent } from '../../../../common/components/ui/button/button.component';
import { RouterLink } from '@angular/router';
import { InputComponent } from '../../../../common/components/ui/form/input/input.component';
import { SwitchComponent } from '../../../../common/components/ui/form/switch/switch.component';
import { InputDateComponent } from "../../../../common/components/ui/form/input-date/input-date/input-date.component";

@Component({
  selector: 'app-novedad-formulario',
  standalone: true,
  imports: [
    CommonModule,
    ButtonComponent,
    ReactiveFormsModule,
    RouterLink,
    InputComponent,
    SwitchComponent,
    InputDateComponent
],
  templateUrl: './novedad-formulario.component.html',
  styleUrl: './novedad-formulario.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class NovedadFormularioComponent
  extends General
  implements OnInit
{
  @Input() informacionNovedad: any;
  @Input({ required: true }) formularioTipo: 'editar' | 'crear';
  @Output() dataFormulario: EventEmitter<any> = new EventEmitter();

  public formularioNovedad = new FormGroup({
    fecha: new FormControl(''),
    visita: new FormControl(''),
    descripcion: new FormControl(''),
    solucion: new FormControl(''),
    estado_solucion: new FormControl(false),
  });

  ngOnInit(): void {
    if (this.formularioTipo === 'editar') {
      this.formularioNovedad.patchValue({
        fecha: this.informacionNovedad.fecha,
        visita: this.informacionNovedad.visita_id,
        descripcion: this.informacionNovedad.descripcion,
        solucion: this.informacionNovedad.solucion,
        estado_solucion: this.informacionNovedad.estado_solucion,
      });
    }
  }

  enviar() {
    if (this.formularioNovedad.valid) {
      return this.dataFormulario.emit(this.formularioNovedad.value);
    } else {
      this.formularioNovedad.markAllAsTouched();
    }
  }
}
