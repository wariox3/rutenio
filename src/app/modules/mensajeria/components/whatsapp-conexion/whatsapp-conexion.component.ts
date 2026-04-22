import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs';
import { MensajeriaApiService } from '../../servicios/mensajeria-api.service';
import { WhatsappConexion } from '../../interfaces/conexion.interface';
import { AlertaService } from '../../../../common/services/alerta.service';

@Component({
  selector: 'app-whatsapp-conexion',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './whatsapp-conexion.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class WhatsappConexionComponent implements OnInit {
  private _api = inject(MensajeriaApiService);
  private _alerta = inject(AlertaService);
  private _cdr = inject(ChangeDetectorRef);

  cargando = true;
  probando = false;
  conexion: WhatsappConexion | null = null;

  ngOnInit(): void {
    this._cargarConexion();
  }

  private _cargarConexion(): void {
    this.cargando = true;
    this._api.obtenerConexion().pipe(
      finalize(() => { this.cargando = false; this._cdr.markForCheck(); }),
    ).subscribe({
      next: (conexion) => { this.conexion = conexion; },
      error: () => { this.conexion = null; },
    });
  }

  probar(): void {
    if (!this.conexion) return;
    this.probando = true;
    this._api.probarConexion().pipe(
      finalize(() => { this.probando = false; this._cdr.markForCheck(); }),
    ).subscribe({
      next: (resp) => {
        if (resp.ok) {
          this._alerta.mensajaExitoso('Conexión OK');
          this._cargarConexion();
        } else {
          this._alerta.mensajeError('No responde', resp.mensaje || '');
        }
      },
      error: (err) => {
        this._alerta.mensajeError('Error al probar', err?.error?.mensaje || err?.message || '');
      },
    });
  }
}
