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
import { InputDateComponent } from '../../../../common/components/ui/form/input-date/input-date/input-date.component';
import { InputTextareaComponent } from '../../../../common/components/ui/form/input-textarea/input-textarea.component';
import { AutocompletarTipoNovedad } from '../../../../interfaces/general/autocompletar.interface';
import { NovedadService } from '../../servicios/novedad.service';
import { LabelComponent } from '../../../../common/components/ui/form/label/label.component';
import { GeneralApiService } from '../../../../core';
import { RespuestaApi } from '../../../../core/types/api.type';

@Component({
  selector: 'app-novedad-formulario',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextareaComponent,
    LabelComponent,
    InputComponent,
    SwitchComponent,
    ButtonComponent,
    RouterLink,
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

  private _novedadService = inject(NovedadService);
  private _generalApiService = inject(GeneralApiService);

  public arrTipoNovedad: AutocompletarTipoNovedad[] = [];

  public formularioNovedad = new FormGroup({
    novedad_tipo: new FormControl(null, [Validators.required]),
    fecha: new FormControl(''),
    visita: new FormControl('', [Validators.required]),
    descripcion: new FormControl('', [Validators.required]),
  });

  constructor() {
    super();
  }

  ngOnInit(): void {
    this._consultarInformacion();
    if (this.formularioTipo === 'editar') {
      this.formularioNovedad.patchValue({
        fecha: this.informacionNovedad.fecha,
        visita: this.informacionNovedad.visita_id,
        descripcion: this.informacionNovedad.descripcion,
        novedad_tipo: this.informacionNovedad.tipo_novedad_id,
      });
    } else {
      this.formularioNovedad.patchValue({
        fecha: new Date().toISOString(),
      });
    }
  }

  private getCurrentDateTime(): string {
    const now = new Date();
    return now.toLocaleString();
  }

  private _consultarInformacion() {
    this._generalApiService
      .consultaApi<any>('ruteo/novedad_tipo/seleccionar/')
      .subscribe((respuesta) => {
        this.arrTipoNovedad = respuesta;
        this.changeDetectorRef.detectChanges();
      });
  }

  enviar() {
    if (this.formularioNovedad.valid) {
      return this.dataFormulario.emit(this.formularioNovedad.value);
    } else {
      this.formularioNovedad.markAllAsTouched();
    }
  }
}
