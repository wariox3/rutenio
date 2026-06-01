import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { catchError, of, Subject, takeUntil } from 'rxjs';
import { MensajeriaApiService } from '../../servicios/mensajeria-api.service';
import { AlertaService } from '../../../../common/services/alerta.service';
import { TelefonoWhatsappValidator } from '../../../../common/validaciones/telefono-whatsapp.validator';
import { AdminDirective } from '../../../../common/directivas/admin.directive';
import { WhatsappConexion } from '../../interfaces/conexion.interface';
import {
  PlantillaSelectorComponent,
  PlantillaSeleccion,
} from '../plantilla-selector/plantilla-selector.component';

type EstadoConexion = 'verificando' | 'activo' | 'no_configurado' | 'pendiente' | 'error';

@Component({
  selector: 'app-nueva-conversacion-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PlantillaSelectorComponent, AdminDirective],
  templateUrl: './nueva-conversacion-modal.component.html',
  styleUrl: './nueva-conversacion-modal.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NuevaConversacionModalComponent implements OnChanges, OnDestroy {
  private _api = inject(MensajeriaApiService);
  private _alerta = inject(AlertaService);
  private _cdr = inject(ChangeDetectorRef);
  private _router = inject(Router);
  private _destroy$ = new Subject<void>();

  @Input() abierto = false;
  @Output() cerrar = new EventEmitter<void>();
  @Output() conversacionCreada = new EventEmitter<number>();

  enviando = false;
  resetSelectorSignal = 0;

  estadoConexion: EstadoConexion = 'verificando';
  mensajeConexionError = '';

  form = new FormGroup({
    telefono: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, TelefonoWhatsappValidator.validar],
    }),
    nombre: new FormControl<string>('', { nonNullable: true }),
  });

  private _plantillaSeleccion: PlantillaSeleccion | null = null;
  plantillaInvalida = true;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['abierto'] && changes['abierto'].currentValue === true) {
      this._verificarConexion();
    }
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  onPlantillaValidityChange(valid: boolean): void {
    this.plantillaInvalida = !valid;
    this._cdr.detectChanges();
  }

  onPlantillaValueChange(seleccion: PlantillaSeleccion | null): void {
    this._plantillaSeleccion = seleccion;
  }

  irAConfigurarWhatsapp(): void {
    this.cerrar.emit();
    this._router.navigate(['/admin/whatsapp']);
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
        this._mostrarErrorEnvio(err);
        this._cdr.detectChanges();
      },
    });
  }

  cerrarSinEnviar(): void {
    this._resetForm();
    this.cerrar.emit();
  }

  private _verificarConexion(): void {
    this.estadoConexion = 'verificando';
    this.mensajeConexionError = '';
    this._cdr.detectChanges();
    this._api
      .obtenerConexion()
      .pipe(
        takeUntil(this._destroy$),
        catchError(() => of(null as WhatsappConexion | null)),
      )
      .subscribe((conexion) => {
        if (!conexion) {
          this.estadoConexion = 'no_configurado';
        } else if (conexion.estado === 'activo') {
          this.estadoConexion = 'activo';
        } else if (conexion.estado === 'pendiente') {
          this.estadoConexion = 'pendiente';
        } else {
          this.estadoConexion = 'error';
          this.mensajeConexionError = conexion.error_mensaje || '';
        }
        this._cdr.detectChanges();
      });
  }

  private _mostrarErrorEnvio(err: any): void {
    const codigo = err?.error?.codigo;
    const detail = err?.error?.detail;
    const mensaje = err?.error?.mensaje;
    if (codigo === 'whatsapp_no_configurado') {
      this.estadoConexion = 'no_configurado';
      this._cdr.detectChanges();
      return;
    }
    if (codigo === 'whatsapp_pendiente') {
      this.estadoConexion = 'pendiente';
      this._cdr.detectChanges();
      return;
    }
    if (codigo === 'whatsapp_error') {
      this.estadoConexion = 'error';
      this.mensajeConexionError = detail || '';
      this._cdr.detectChanges();
      return;
    }
    this._alerta.mensajeError(
      'No se pudo iniciar la conversación',
      mensaje || detail || err?.message || 'Error desconocido',
    );
  }

  private _resetForm(): void {
    this.form.reset({ telefono: '', nombre: '' });
    this.resetSelectorSignal++;
  }
}
