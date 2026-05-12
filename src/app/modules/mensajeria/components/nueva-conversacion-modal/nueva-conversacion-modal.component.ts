import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  inject,
  Input,
  Output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MensajeriaApiService } from '../../servicios/mensajeria-api.service';
import { AlertaService } from '../../../../common/services/alerta.service';
import { TelefonoWhatsappValidator } from '../../../../common/validaciones/telefono-whatsapp.validator';
import {
  PlantillaSelectorComponent,
  PlantillaSeleccion,
} from '../plantilla-selector/plantilla-selector.component';

@Component({
  selector: 'app-nueva-conversacion-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PlantillaSelectorComponent],
  templateUrl: './nueva-conversacion-modal.component.html',
  styleUrl: './nueva-conversacion-modal.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NuevaConversacionModalComponent {
  private _api = inject(MensajeriaApiService);
  private _alerta = inject(AlertaService);
  private _cdr = inject(ChangeDetectorRef);

  @Input() abierto = false;
  @Output() cerrar = new EventEmitter<void>();
  @Output() conversacionCreada = new EventEmitter<number>();

  enviando = false;
  resetSelectorSignal = 0;

  /** Form con sólo lo específico de "nueva conversación" — la plantilla la maneja
   *  el subcomponente PlantillaSelector. */
  form = new FormGroup({
    telefono: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, TelefonoWhatsappValidator.validar],
    }),
    nombre: new FormControl<string>('', { nonNullable: true }),
  });

  /** Última selección emitida por el subcomponente PlantillaSelector. */
  private _plantillaSeleccion: PlantillaSeleccion | null = null;
  plantillaInvalida = true;

  onPlantillaValidityChange(valid: boolean): void {
    this.plantillaInvalida = !valid;
    this._cdr.detectChanges();
  }

  onPlantillaValueChange(seleccion: PlantillaSeleccion | null): void {
    this._plantillaSeleccion = seleccion;
  }

  enviar(): void {
    if (this.form.invalid || this.plantillaInvalida || !this._plantillaSeleccion || this.enviando) {
      this.form.markAllAsTouched();
      return;
    }
    const valor = this.form.getRawValue();
    const payload = {
      telefono: valor.telefono.trim(),
      nombre: valor.nombre?.trim() || undefined,
      ...this._plantillaSeleccion,
    };
    this.enviando = true;
    this._api.iniciarConversacion(payload).subscribe({
      next: (resp) => {
        this.enviando = false;
        if (resp.ok && resp.conversacion_id) {
          this.conversacionCreada.emit(resp.conversacion_id);
          this._resetForm();
          this.cerrar.emit();
        } else {
          this._alerta.mensajeError('No se envió', resp.mensaje || 'Error desconocido');
        }
        this._cdr.detectChanges();
      },
      error: (err) => {
        this.enviando = false;
        this._alerta.mensajeError(
          'No se pudo iniciar la conversación',
          err?.error?.mensaje || err?.error?.detail || err?.message || 'Error desconocido',
        );
        this._cdr.detectChanges();
      },
    });
  }

  cerrarSinEnviar(): void {
    this._resetForm();
    this.cerrar.emit();
  }

  private _resetForm(): void {
    this.form.reset({ telefono: '', nombre: '' });
    // Pedirle al subcomponente que se resetee preservando la plantilla actual.
    this.resetSelectorSignal++;
  }
}
