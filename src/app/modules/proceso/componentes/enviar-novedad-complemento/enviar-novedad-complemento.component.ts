import { Component, inject, signal } from '@angular/core';
import { ButtonComponent } from '../../../../common/components/ui/button/button.component';
import { AlertaService } from '../../../../common/services/alerta.service';
import { NovedadService } from '../../../novedad/servicios/novedad.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-enviar-novedad-complemento',
  standalone: true,
  imports: [ButtonComponent],
  templateUrl: './enviar-novedad-complemento.component.html',
  styleUrl: './enviar-novedad-complemento.component.scss',
})
export default class EnviarNovedadComplementoComponent {
  private readonly _novedadApiService = inject(NovedadService);
  private readonly _alertaService = inject(AlertaService);
  public estaCargando$ = signal<boolean>(false);

  constructor() {}

  enviarNovedadComplemento() {
    this.estaCargando$.set(true);
    this._novedadApiService
       .enviarNovedadComplemento()
      .pipe(
        finalize(() => {
          this.estaCargando$.set(false);
        })
      )
      .subscribe((res) => {
        this._alertaService.mensajaExitoso(res.mensaje);
      });
  }
}
