import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { General } from '../../../../common/clases/general';
import {
  obtenerUsuarioId,
  obtenerValidacionSaldo,
} from '../../../../redux/selectors/usuario.selector';
import { FacturacionService } from '../../servicios/facturacion.service';
import { of, switchMap, tap } from 'rxjs';
import { usuarioActionActualizarVrSaldo } from '../../../../redux/actions/auth/usuario.actions';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-facturacion-mensaje-pago',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './facturacion-mensaje-pago.component.html',
  styleUrl: './facturacion-mensaje-pago.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FacturacionMensajePagoComponent extends General implements OnInit {
  procesando = true;
  vr_saldo: number;

  constructor(private facturacionService: FacturacionService) {
    super();
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.procesando = false;
      this.changeDetectorRef.detectChanges();
      this.consultarInformacion();
    }, 5000);
  }

  consultarInformacion() {
    this.store
      .select(obtenerUsuarioId)
      .pipe(
        switchMap((respuestaUsuarioId) =>
          this.facturacionService.obtenerUsuarioVrSaldo(respuestaUsuarioId)
        ),
        switchMap((respuestaUsuarioVrSaldo) => {
          this.vr_saldo = respuestaUsuarioVrSaldo.saldo;
          this.changeDetectorRef.detectChanges();
          return this.store.select(
            obtenerValidacionSaldo(respuestaUsuarioVrSaldo.saldo)
          );
        }),
        tap((respuestaUsuarioValidarSaldo) => {
          if (respuestaUsuarioValidarSaldo) {
            this.store.dispatch(
              usuarioActionActualizarVrSaldo({
                vr_saldo: this.vr_saldo,
              })
            );
            this.changeDetectorRef.detectChanges();
            location.reload();
          }
          of(null);
        })
      )
      .subscribe();
    this.changeDetectorRef.detectChanges();
  }
}
