import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { finalize } from 'rxjs';
import { ButtonComponent } from '../../../../common/components/ui/button/button.component';
import { AlertaService } from '../../../../common/services/alerta.service';
import { VisitaApiService } from '../../../visita/servicios/visita-api.service';

@Component({
  selector: 'app-enviar-entrega-complemento',
  standalone: true,
  imports: [ButtonComponent],
  templateUrl: './enviar-entrega-complemento.component.html',
  styleUrl: './enviar-entrega-complemento.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class EnviarEntregaComplementoComponent {
  private readonly _visitaApiService = inject(VisitaApiService);
  private readonly _alertaService = inject(AlertaService);

  public estaCargando$ = signal<boolean>(false);

  constructor() {}

  enviarEntregaComplemento() {
    this.estaCargando$.set(true);
    this._visitaApiService
      .enviarEntregaComplemento()
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
