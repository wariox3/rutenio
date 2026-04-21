import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { MensajeriaApiService } from '../../servicios/mensajeria-api.service';
import { WhatsappConexion } from '../../interfaces/conexion.interface';
import { AlertaService } from '../../../../common/services/alerta.service';

@Component({
  selector: 'app-whatsapp-conexion',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './whatsapp-conexion.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class WhatsappConexionComponent implements OnInit {
  private _api = inject(MensajeriaApiService);
  private _alerta = inject(AlertaService);
  private _cdr = inject(ChangeDetectorRef);

  cargando = true;
  guardando = false;
  probando = false;
  conexion: WhatsappConexion | null = null;
  mostrarFormulario = false;

  formulario = new FormGroup({
    phone_number_id: new FormControl('', [Validators.required]),
    waba_id: new FormControl('', [Validators.required]),
    access_token: new FormControl('', [Validators.required, Validators.minLength(30)]),
    app_secret: new FormControl(''),
    verify_token: new FormControl(''),
  });

  ngOnInit(): void {
    this._cargarConexion();
  }

  private _cargarConexion(): void {
    this.cargando = true;
    this._api.obtenerConexion().pipe(
      finalize(() => { this.cargando = false; this._cdr.detectChanges(); }),
    ).subscribe({
      next: (conexion) => {
        this.conexion = conexion;
        this.mostrarFormulario = false;
        this.formulario.patchValue({
          phone_number_id: conexion.phone_number_id,
          waba_id: conexion.waba_id,
          verify_token: conexion.verify_token,
        });
      },
      error: () => {
        this.conexion = null;
        this.mostrarFormulario = true;
      },
    });
  }

  editar(): void {
    this.mostrarFormulario = true;
    this.formulario.get('access_token')?.reset('');
    this._cdr.detectChanges();
  }

  cancelar(): void {
    if (this.conexion) {
      this.mostrarFormulario = false;
      this._cdr.detectChanges();
    }
  }

  guardar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }
    this.guardando = true;
    const datos = this.formulario.getRawValue();
    this._api.guardarConexion({
      phone_number_id: datos.phone_number_id!,
      waba_id: datos.waba_id!,
      access_token: datos.access_token!,
      app_secret: datos.app_secret || undefined,
      verify_token: datos.verify_token || undefined,
    }).pipe(
      finalize(() => { this.guardando = false; this._cdr.detectChanges(); }),
    ).subscribe({
      next: (conexion) => {
        this.conexion = conexion;
        this.mostrarFormulario = false;
        if (conexion.estado === 'activo') {
          this._alerta.mensajaExitoso('Conexión WhatsApp activa');
        } else {
          this._alerta.mensajeError('Conexión guardada pero con error', conexion.error_mensaje || '');
        }
      },
      error: (err) => {
        this._alerta.mensajeError('No se pudo guardar', err?.error?.detail || err?.message || 'Error desconocido');
      },
    });
  }

  probar(): void {
    if (!this.conexion) return;
    this.probando = true;
    this._api.probarConexion().pipe(
      finalize(() => { this.probando = false; this._cdr.detectChanges(); }),
    ).subscribe({
      next: (resp) => {
        if (resp.ok) {
          this._alerta.mensajaExitoso('Conexión OK');
          this._cargarConexion();
        } else {
          this._alerta.mensajeError('La conexión no responde', resp.mensaje || '');
        }
      },
      error: (err) => {
        this._alerta.mensajeError('Error al probar', err?.error?.mensaje || err?.message || '');
      },
    });
  }
}
