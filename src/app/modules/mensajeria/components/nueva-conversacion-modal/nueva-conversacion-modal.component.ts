import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormArray,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MensajeriaApiService } from '../../servicios/mensajeria-api.service';
import { PlantillaWhatsapp } from '../../interfaces/plantilla.interface';
import { AlertaService } from '../../../../common/services/alerta.service';
import { TelefonoWhatsappValidator } from '../../../../common/validaciones/telefono-whatsapp.validator';

@Component({
  selector: 'app-nueva-conversacion-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './nueva-conversacion-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NuevaConversacionModalComponent implements OnChanges {
  private _api = inject(MensajeriaApiService);
  private _alerta = inject(AlertaService);
  private _cdr = inject(ChangeDetectorRef);

  @Input() abierto = false;
  @Output() cerrar = new EventEmitter<void>();
  @Output() conversacionCreada = new EventEmitter<number>();

  plantillas: PlantillaWhatsapp[] = [];
  cargandoPlantillas = false;
  enviando = false;
  private _plantillasCargadas = false;

  form = new FormGroup({
    telefono: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, TelefonoWhatsappValidator.validar],
    }),
    nombre: new FormControl<string>('', { nonNullable: true }),
    plantilla_nombre: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    variables: new FormArray<FormControl<string>>([]),
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['abierto'] && this.abierto && !this._plantillasCargadas) {
      this._cargarPlantillas();
    }
  }

  private _cargarPlantillas(): void {
    this.cargandoPlantillas = true;
    this._api.listarPlantillas().subscribe({
      next: (lista) => {
        this.plantillas = lista || [];
        this._plantillasCargadas = true;
        this.cargandoPlantillas = false;
        // Pre-seleccionar 'entrega' si existe; si no, la primera con variables
        const preferida = this.plantillas.find((p) => p.nombre === 'entrega') ?? this.plantillas[0];
        if (preferida) this.form.controls.plantilla_nombre.setValue(preferida.nombre);
        this._cdr.detectChanges();
      },
      error: (err) => {
        this.cargandoPlantillas = false;
        this._alerta.mensajeError(
          'No se pudieron cargar las plantillas',
          err?.error?.detail || err?.message || 'Verifica tu conexión',
        );
        this._cdr.detectChanges();
      },
    });
  }

  /** Plantilla actualmente seleccionada (o null). */
  get plantillaSeleccionada(): PlantillaWhatsapp | null {
    const nombre = this.form.controls.plantilla_nombre.value;
    return this.plantillas.find((p) => p.nombre === nombre) ?? null;
  }

  /** Vista previa con variables interpoladas. */
  get previewTexto(): string {
    const plantilla = this.plantillaSeleccionada;
    if (!plantilla) return '';
    let texto = plantilla.texto;
    plantilla.variables.forEach((v, idx) => {
      const valor = this.form.controls.variables.at(idx)?.value || '_____';
      texto = texto.replaceAll(`{${v.indice}}`, valor);
    });
    return texto;
  }

  /** Re-arma el FormArray de variables al cambiar la plantilla seleccionada. */
  onPlantillaCambia(): void {
    const plantilla = this.plantillaSeleccionada;
    const arr = this.form.controls.variables;
    while (arr.length) arr.removeAt(0);
    if (plantilla) {
      plantilla.variables.forEach(() => {
        arr.push(new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }));
      });
    }
    this._cdr.detectChanges();
  }

  enviar(): void {
    if (this.form.invalid || this.enviando) {
      this.form.markAllAsTouched();
      return;
    }
    const valor = this.form.getRawValue();
    const payload = {
      telefono: valor.telefono.trim(),
      nombre: valor.nombre?.trim() || undefined,
      plantilla_nombre: valor.plantilla_nombre,
      plantilla_idioma: this.plantillaSeleccionada?.idioma || 'es',
      plantilla_variables: valor.variables,
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
    const plantillaActual = this.form.controls.plantilla_nombre.value;
    this.form.reset({ telefono: '', nombre: '', plantilla_nombre: plantillaActual });
    this.onPlantillaCambia();
  }

  trackByIndice = (_: number, v: { indice: number }) => v.indice;
}
