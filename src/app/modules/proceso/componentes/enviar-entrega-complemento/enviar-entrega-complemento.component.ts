import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { finalize } from 'rxjs';
import { ButtonComponent } from '../../../../common/components/ui/button/button.component';
import { AlertaService } from '../../../../common/services/alerta.service';
import { EntregaComplementoRespuesta } from '../../../visita/interfaces/visita.interface';
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
  public resultado$ = signal<EntregaComplementoRespuesta | null>(null);

  enviarEntregaComplemento() {
    this.estaCargando$.set(true);
    this.resultado$.set(null);
    this._visitaApiService
      .enviarEntregaComplemento()
      .pipe(
        finalize(() => {
          this.estaCargando$.set(false);
        })
      )
      .subscribe({
        next: (res) => {
          const resultado = { ...res, fallidas: res.fallidas ?? [] };
          this.resultado$.set(resultado);
          if (resultado.fallidas.length === 0) {
            this._alertaService.mensajaExitoso(
              resultado.mensaje,
              'Sincronización completa'
            );
          }
        },
        error: () => {},
      });
  }
}
