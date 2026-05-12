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
import { MensajeriaApiService } from '../../servicios/mensajeria-api.service';
import { AlertaService } from '../../../../common/services/alerta.service';
import {
  PlantillaSelectorComponent,
  PlantillaSeleccion,
} from '../plantilla-selector/plantilla-selector.component';

/**
 * Modal de "Enviar plantilla" para una conversación EXISTENTE.
 *
 * Reusa PlantillaSelector para todo lo de elegir plantilla + variables + preview,
 * y llama enviarMensaje(conversacionId, {tipo:'template', ...}) al confirmar.
 */
@Component({
  selector: 'app-enviar-plantilla-modal',
  standalone: true,
  imports: [CommonModule, PlantillaSelectorComponent],
  templateUrl: './enviar-plantilla-modal.component.html',
  styleUrl: './enviar-plantilla-modal.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EnviarPlantillaModalComponent {
  private _api = inject(MensajeriaApiService);
  private _alerta = inject(AlertaService);
  private _cdr = inject(ChangeDetectorRef);

  @Input() abierto = false;
  @Input() conversacionId: number | null = null;
  /** Texto descriptivo del destinatario (nombre o teléfono) — se muestra en el header. */
  @Input() destinatarioLabel: string | null = null;

  @Output() cerrar = new EventEmitter<void>();
  @Output() enviado = new EventEmitter<{ mensaje_id?: number; whatsapp_message_id?: string }>();

  enviando = false;
  resetSelectorSignal = 0;
  plantillaInvalida = true;
  private _plantillaSeleccion: PlantillaSeleccion | null = null;

  onPlantillaValidityChange(valid: boolean): void {
    this.plantillaInvalida = !valid;
    this._cdr.detectChanges();
  }

  onPlantillaValueChange(seleccion: PlantillaSeleccion | null): void {
    this._plantillaSeleccion = seleccion;
  }

  enviar(): void {
    if (
      !this.conversacionId ||
      this.plantillaInvalida ||
      !this._plantillaSeleccion ||
      this.enviando
    ) {
      return;
    }
    const payload = {
      tipo: 'template' as const,
      plantilla_nombre: this._plantillaSeleccion.plantilla_nombre,
      plantilla_idioma: this._plantillaSeleccion.plantilla_idioma,
      plantilla_variables: this._plantillaSeleccion.plantilla_variables,
    };
    this.enviando = true;
    this._api.enviarMensaje(this.conversacionId, payload).subscribe({
      next: (resp) => {
        this.enviando = false;
        if (resp.ok) {
          this.enviado.emit({
            mensaje_id: resp.mensaje_id,
            whatsapp_message_id: resp.whatsapp_message_id,
          });
          this._reset();
          this.cerrar.emit();
        } else {
          this._alerta.mensajeError('No se envió', resp.mensaje || 'Error desconocido');
        }
        this._cdr.detectChanges();
      },
      error: (err) => {
        this.enviando = false;
        this._alerta.mensajeError(
          'No se pudo enviar la plantilla',
          err?.error?.mensaje || err?.error?.detail || err?.message || 'Error desconocido',
        );
        this._cdr.detectChanges();
      },
    });
  }

  cerrarSinEnviar(): void {
    this._reset();
    this.cerrar.emit();
  }

  private _reset(): void {
    this.resetSelectorSignal++;
  }
}
