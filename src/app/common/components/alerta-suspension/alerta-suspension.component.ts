import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { General } from '../../clases/general';
import { combineLatest, Subject, takeUntil } from 'rxjs';
import {
  obtenerUsuarioFechaLimitePago,
  obtenerUsuarioId,
  obtenerUsuarioSuspencion,
  obtenerUsuarioVrSaldo,
} from '../../../redux/selectors/usuario.selector';
import { FacturacionService } from '../../../modules/facturacion/servicios/facturacion.service';
import { usuarioActionActualizarVrCredito, usuarioActionActualizarVrSaldo } from '../../../redux/actions/auth/usuario.actions';

@Component({
  selector: 'app-alerta-suspension',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './alerta-suspension.component.html',
  styleUrl: './alerta-suspension.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlertaSuspensionComponent extends General implements OnInit, OnDestroy {
  private _facturacionService = inject(FacturacionService);
  private _unsubscribe$ = new Subject<void>();
  
  constructor() {
    super();
  }

  visualizarAlerta = false;
  usuarioFechaLimitePago: Date;
  usuarioVrSaldo: number;
  usuarioID: string;
  hoy: Date = new Date();

  ngOnDestroy() {
    this._unsubscribe$.next();
    this._unsubscribe$.complete();
  }

  ngOnInit() {
    combineLatest([
      this.store.select(obtenerUsuarioSuspencion),
      this.store.select(obtenerUsuarioFechaLimitePago),
      this.store.select(obtenerUsuarioVrSaldo),
      this.store.select(obtenerUsuarioId)
    ]).subscribe((respuesta: any) => {
      this.visualizarAlerta = respuesta[0];
      this.usuarioFechaLimitePago = new Date(respuesta[1]);
      this.usuarioFechaLimitePago.setDate(
        this.usuarioFechaLimitePago.getDate() + 1
      );
      this.usuarioVrSaldo = respuesta[2];
      this.usuarioID = respuesta[3];
    });
    this.changeDetectorRef.detectChanges();
  }

  navegar() {
    this.router.navigate([`/facturacion/lista`]);
  }

  validarEstado() {
    localStorage.removeItem('isFirstTime');
    this.changeDetectorRef.detectChanges();
    this.router.navigate([`/estado`]);
  }

  actualizarPago() {
    this._facturacionService
    .obtenerUsuarioVrSaldo(this.usuarioID)
    .pipe(takeUntil(this._unsubscribe$))
    .subscribe((respuesta) => {
      if (respuesta.saldo > 0) {
        this.alerta.mensajeInformativo(
          'Información',
          `El usuario aún cuenta con pagos pendientes. Si ya realizó el pago, por favor comuníquese con nuestro equipo de soporte al WhatsApp 333 2590638`,
        );
      } else {
        this.visualizarAlerta = false;
      }
      this.store.dispatch(
        usuarioActionActualizarVrSaldo({
          vr_saldo: respuesta.saldo,
        }),
      );
      this.store.dispatch(
        usuarioActionActualizarVrCredito({
          vr_credito: respuesta.credito,
        }),
      );
      this.changeDetectorRef.detectChanges();
    });
  }
}
