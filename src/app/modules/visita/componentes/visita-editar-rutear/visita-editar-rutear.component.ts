import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { General } from '../../../../common/clases/general';
import { ButtonComponent } from '../../../../common/components/ui/button/button.component';
import { LabelComponent } from '../../../../common/components/ui/form/label/label.component';
import { VisitaApiService } from '../../servicios/visita-api.service';
import { InputComponent as InputUiComponent } from '@tamerlantian/ui-components';
import { SoloNumerosDirective } from '../../../../common/directivas/solo-numeros.directive';
import { InputNumericoValidator } from '../../../../common/validaciones/input-numerico.validator';
import { cambiarVacioPorNulo } from '../../../../common/validaciones/campo-no-obligatorio.validator';
import { CitaRangoValidator } from '../../../../common/validaciones/cita-rango.validator';

@Component({
  selector: 'app-visita-editar-rutear',
  standalone: true,
  imports: [
    ButtonComponent,
    ReactiveFormsModule,
    LabelComponent,
    InputUiComponent,
  ],
  templateUrl: './visita-editar-rutear.component.html',
  styleUrl: './visita-editar-rutear.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VisitaEditarRutearComponent extends General implements OnInit {
  private readonly _visitaApiService = inject(VisitaApiService);

  @Input() visita;
  @Output() emitirCerrarModal = new EventEmitter<void>();
  public minFechaCita = this.obtenerFechaHoraActual();

  private obtenerFechaHoraActual(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}T${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  }

  public formularioVisitaRutear = new FormGroup({
    id: new FormControl(''),
    numero: new FormControl('', [
      cambiarVacioPorNulo.validar,
      Validators.max(2147483647),
    ]),
    documento: new FormControl(''),
    destinatario: new FormControl('', [Validators.required]),
    destinatario_direccion: new FormControl('', [Validators.required]),
    destinatario_telefono: new FormControl(''),
    destinatario_correo: new FormControl(''),
    unidades: new FormControl('', [Validators.required, Validators.min(1)]),
    peso: new FormControl('', [Validators.required, Validators.min(1)]),
    volumen: new FormControl('', [Validators.required, Validators.min(1)]),
    cita_inicio: new FormControl(null),
    cita_fin: new FormControl(null),
  }, { validators: CitaRangoValidator.validar });

  ngOnInit(): void {
    this.formularioVisitaRutear.patchValue({
      id: this.visita?.id,
      numero: this.visita?.numero,
      documento: this.visita?.documento,
      destinatario: this.visita?.destinatario,
      destinatario_direccion: this.visita?.destinatario_direccion,
      destinatario_correo: this.visita?.destinatario_correo,
      destinatario_telefono: this.visita?.destinatario_telefono,
      unidades: this.visita?.unidades,
      peso: this.visita?.peso,
      volumen: this.visita?.volumen,
      cita_inicio: this.normalizarCitaParaInput(this.visita?.cita_inicio),
      cita_fin: this.normalizarCitaParaInput(this.visita?.cita_fin),
    });
  }

  onKeyDown(event: KeyboardEvent): void {
    InputNumericoValidator.onKeyDown(event);
  }

  enviar() {
    const datos = { ...this.formularioVisitaRutear.value };
    if (!datos.cita_inicio || !datos.cita_fin) {
      datos.cita_inicio = null;
      datos.cita_fin = null;
    } else {
      datos.cita_inicio = this.formatearCitaParaApi(datos.cita_inicio);
      datos.cita_fin = this.formatearCitaParaApi(datos.cita_fin);
    }
    this._visitaApiService
      .actualizarDireccion(datos)
      .subscribe((response) => {
        this.alerta.mensajaExitoso('Se actualizó la visita');
        this.emitirCerrarModal.emit();
      });
  }

  private formatearCitaParaApi(valor: string): string {
    if (!valor) return valor;
    return valor.length === 16 ? `${valor}:00` : valor;
  }

  private normalizarCitaParaInput(valor: string | null): string | null {
    if (!valor) return null;
    return valor.replace(' ', 'T').substring(0, 16);
  }
}
