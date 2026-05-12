import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MensajeriaApiService } from '../../servicios/mensajeria-api.service';
import { PlantillaWhatsapp } from '../../interfaces/plantilla.interface';
import {
  PlantillaMeta,
  VariableMeta,
  obtenerPlantillaMeta,
} from '../../interfaces/plantilla-meta';
import { AlertaService } from '../../../../common/services/alerta.service';

export interface PlantillaSeleccion {
  plantilla_nombre: string;
  plantilla_idioma: string;
  plantilla_variables: string[];
}

interface PlantillaUI extends PlantillaWhatsapp {
  meta: PlantillaMeta;
}

interface PreviewSegment {
  texto: string;
  esVariable: boolean;
  llena: boolean;
}

/**
 * Subcomponente reutilizable: selector visual de plantilla + variables descriptivas
 * + preview con highlight. Lo usan tanto el modal de "+ Nueva conversación" como
 * el modal de "Enviar plantilla" en una conversación existente.
 */
@Component({
  selector: 'app-plantilla-selector',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './plantilla-selector.component.html',
  styleUrl: './plantilla-selector.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlantillaSelectorComponent implements OnInit, OnChanges {
  private _api = inject(MensajeriaApiService);
  private _alerta = inject(AlertaService);
  private _cdr = inject(ChangeDetectorRef);

  /** Nombre de plantilla a pre-seleccionar al cargar. Default 'entrega' si existe. */
  @Input() preseleccionar: string = 'entrega';
  /** Trigger de reset desde el padre (incrementar para resetear el form). */
  @Input() resetSignal = 0;

  @Output() validityChange = new EventEmitter<boolean>();
  @Output() valueChange = new EventEmitter<PlantillaSeleccion | null>();

  plantillas: PlantillaUI[] = [];
  cargandoPlantillas = false;
  errorPlantillas: string | null = null;
  private _plantillasCargadas = false;

  form = new FormGroup({
    plantilla_nombre: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
    variables: new FormArray<FormControl<string>>([]),
  });

  ngOnInit(): void {
    if (!this._plantillasCargadas) this._cargarPlantillas();
    this.form.valueChanges.subscribe(() => this._emitirCambios());
    this.form.statusChanges.subscribe(() => this._emitirCambios());
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['resetSignal'] && !changes['resetSignal'].firstChange) {
      this._resetFormPreservandoPlantilla();
    }
  }

  reintentar(): void {
    this._cargarPlantillas();
  }

  private _cargarPlantillas(): void {
    this.cargandoPlantillas = true;
    this.errorPlantillas = null;
    this._cdr.detectChanges();
    this._api.listarPlantillas().subscribe({
      next: (lista) => {
        const conMeta: PlantillaUI[] = (lista || []).map((p) => ({
          ...p,
          meta: obtenerPlantillaMeta(p.nombre, p.variables.length),
        }));
        // Ordenar: Utility primero (más baratas y sin opt-in), Marketing al final.
        conMeta.sort((a, b) => {
          const ca = a.meta.categoria === 'marketing' ? 1 : 0;
          const cb = b.meta.categoria === 'marketing' ? 1 : 0;
          return ca - cb;
        });
        this.plantillas = conMeta;
        this._plantillasCargadas = true;
        this.cargandoPlantillas = false;
        const preferida =
          this.plantillas.find((p) => p.nombre === this.preseleccionar) ??
          this.plantillas[0];
        if (preferida) {
          this.form.controls.plantilla_nombre.setValue(preferida.nombre);
          this._reconstruirVariables();
        }
        this._cdr.detectChanges();
      },
      error: (err) => {
        this.cargandoPlantillas = false;
        this.errorPlantillas =
          err?.error?.detail || err?.message || 'No se pudieron cargar las plantillas';
        this._cdr.detectChanges();
      },
    });
  }

  /** Plantilla actualmente seleccionada (con metadatos). */
  get plantillaSeleccionada(): PlantillaUI | null {
    const nombre = this.form.controls.plantilla_nombre.value;
    return this.plantillas.find((p) => p.nombre === nombre) ?? null;
  }

  seleccionarPlantilla(nombre: string): void {
    if (this.form.controls.plantilla_nombre.value === nombre) return;
    this.form.controls.plantilla_nombre.setValue(nombre);
    this._reconstruirVariables();
  }

  /** Devuelve el preview troceado en segmentos para resaltar partes variables. */
  get previewSegmentos(): PreviewSegment[] {
    const plantilla = this.plantillaSeleccionada;
    if (!plantilla) return [];
    const texto = plantilla.texto;
    const segmentos: PreviewSegment[] = [];
    const regex = /\{(\d+)\}/g;
    let match: RegExpExecArray | null;
    let cursor = 0;
    while ((match = regex.exec(texto)) !== null) {
      if (match.index > cursor) {
        segmentos.push({
          texto: texto.slice(cursor, match.index),
          esVariable: false,
          llena: false,
        });
      }
      const idx = parseInt(match[1], 10);
      const indiceLocal = plantilla.variables.findIndex((v) => v.indice === idx);
      const valor = (indiceLocal >= 0
        ? this.form.controls.variables.at(indiceLocal)?.value
        : '') || '';
      segmentos.push({
        texto: valor || this._etiquetaVariable(plantilla.meta.variables[indiceLocal]),
        esVariable: true,
        llena: !!valor,
      });
      cursor = match.index + match[0].length;
    }
    if (cursor < texto.length) {
      segmentos.push({
        texto: texto.slice(cursor),
        esVariable: false,
        llena: false,
      });
    }
    return segmentos;
  }

  private _etiquetaVariable(meta: VariableMeta | undefined): string {
    return meta?.label ? `{${meta.label.toLowerCase()}}` : '_____';
  }

  private _reconstruirVariables(): void {
    const plantilla = this.plantillaSeleccionada;
    const arr = this.form.controls.variables;
    while (arr.length) arr.removeAt(0);
    if (plantilla) {
      plantilla.variables.forEach(() => {
        arr.push(new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }));
      });
    }
    this._cdr.detectChanges();
    this._emitirCambios();
  }

  obtenerValor(): PlantillaSeleccion | null {
    if (this.form.invalid) return null;
    const valor = this.form.getRawValue();
    return {
      plantilla_nombre: valor.plantilla_nombre,
      plantilla_idioma: this.plantillaSeleccionada?.idioma || 'es',
      plantilla_variables: valor.variables,
    };
  }

  private _emitirCambios(): void {
    this.validityChange.emit(this.form.valid);
    this.valueChange.emit(this.obtenerValor());
  }

  private _resetFormPreservandoPlantilla(): void {
    const plantillaActual = this.form.controls.plantilla_nombre.value;
    this.form.reset({ plantilla_nombre: plantillaActual });
    this._reconstruirVariables();
  }

  /** Devuelve el meta de la variable en posición `i` para la plantilla actual. */
  variableMeta(i: number): VariableMeta | null {
    return this.plantillaSeleccionada?.meta.variables[i] ?? null;
  }

  /** Devuelve el FormControl de la variable en posición `i`, si existe. */
  variableControl(i: number): FormControl<string> | null {
    return (this.form.controls.variables.at(i) as FormControl<string>) ?? null;
  }

  /** True si la variable en posición `i` está marcada como tocada y es inválida. */
  variableConError(i: number): boolean {
    const c = this.variableControl(i);
    return !!(c && c.invalid && c.touched);
  }

  /** Aplica el ejemplo sugerido a la variable en posición `i`. */
  usarEjemplo(i: number): void {
    const meta = this.variableMeta(i);
    const ctrl = this.variableControl(i);
    if (meta?.ejemplo && ctrl) {
      ctrl.setValue(meta.ejemplo);
      ctrl.markAsDirty();
    }
  }

  /** True si esta plantilla es la seleccionada (helper para el template). */
  esSeleccionada(nombre: string): boolean {
    return this.plantillaSeleccionada?.nombre === nombre;
  }

  trackByNombre = (_: number, p: PlantillaUI) => p.nombre;
  trackByIndice = (_: number, v: { indice: number }) => v.indice;
}
