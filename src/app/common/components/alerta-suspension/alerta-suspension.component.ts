import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { General } from '../../clases/general';
import { combineLatest } from 'rxjs';
import { obtenerUsuarioFechaLimitePago, obtenerUsuarioSuspencion, obtenerUsuarioVrSaldo } from '../../../redux/selectors/usuario.selector';

@Component({
  selector: 'app-alerta-suspension',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './alerta-suspension.component.html',
  styleUrl: './alerta-suspension.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlertaSuspensionComponent extends General implements OnInit {
  constructor() {
    super();
  }

  visualizarAlerta = false;
  usuarioFechaLimitePago: Date;
  usuarioVrSaldo: number;
  hoy: Date = new Date();

  ngOnInit() {
    combineLatest([
      this.store.select(obtenerUsuarioSuspencion),
      this.store.select(obtenerUsuarioFechaLimitePago),
      this.store.select(obtenerUsuarioVrSaldo),
    ]).subscribe((respuesta: any) => {
      this.visualizarAlerta = respuesta[0];
      this.usuarioFechaLimitePago = new Date(respuesta[1]);
      this.usuarioFechaLimitePago.setDate(
        this.usuarioFechaLimitePago.getDate() + 1
      );
      this.usuarioVrSaldo = respuesta[2];
    });
    this.changeDetectorRef.detectChanges();
  }

  navegar() {
    this.router.navigate([`/facturacion/lista`]);
  }

  validarEstado() {
    localStorage.removeItem('isFirstTime');
    this.changeDetectorRef.detectChanges()
    this.router.navigate([`/estado`]);
  }
}
