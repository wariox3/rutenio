import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { EMPTY, expand, finalize } from 'rxjs';
import { ButtonComponent } from '../../../../common/components/ui/button/button.component';
import { AlertaService } from '../../../../common/services/alerta.service';
import {
  EntregaComplementoFallida,
  EntregaComplementoResumen,
} from '../../../visita/interfaces/visita.interface';
import { VisitaApiService } from '../../../visita/servicios/visita-api.service';

interface ResultadoSincronizacion {
  procesadas: number;
  fallidas: EntregaComplementoFallida[];
  sin_procesar: number;
}

@Component({
  selector: 'app-enviar-entrega-complemento',
  standalone: true,
  imports: [ButtonComponent],
  templateUrl: './enviar-entrega-complemento.component.html',
  styleUrl: './enviar-entrega-complemento.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class EnviarEntregaComplementoComponent implements OnInit {
  private readonly _visitaApiService = inject(VisitaApiService);
  private readonly _alertaService = inject(AlertaService);

  public estaCargando$ = signal<boolean>(false);
  public resumen$ = signal<EntregaComplementoResumen | null>(null);
  public resultado$ = signal<ResultadoSincronizacion | null>(null);
  public progreso$ = signal<{ sincronizadas: number; total: number } | null>(
    null
  );
  public porcentajeProgreso$ = computed(() => {
    const progreso = this.progreso$();
    if (!progreso || progreso.total === 0) {
      return 0;
    }
    return Math.min(
      100,
      Math.round((progreso.sincronizadas / progreso.total) * 100)
    );
  });

  ngOnInit() {
    this.cargarResumen();
  }

  cargarResumen() {
    this._visitaApiService
      .obtenerResumenEntregaComplemento()
      .subscribe((res) => {
        this.resumen$.set(res);
      });
  }

  sincronizar(reiniciarDescartadas = false) {
    const resumen = this.resumen$();
    const total =
      (resumen?.pendientes ?? 0) +
      (reiniciarDescartadas ? resumen?.descartadas ?? 0 : 0);
    this.estaCargando$.set(true);
    this.resultado$.set(null);
    this.progreso$.set({ sincronizadas: 0, total });
    let procesadas = 0;
    let sinProcesar = 0;
    const fallidas = new Map<number, EntregaComplementoFallida>();
    this._visitaApiService
      .enviarEntregaComplemento(reiniciarDescartadas)
      .pipe(
        expand((res) =>
          res.procesadas > 0 && (res.sin_procesar ?? 0) > 0
            ? this._visitaApiService.enviarEntregaComplemento()
            : EMPTY
        ),
        finalize(() => {
          this.estaCargando$.set(false);
          this.progreso$.set(null);
          this.cargarResumen();
        })
      )
      .subscribe({
        next: (res) => {
          procesadas += res.procesadas;
          sinProcesar = res.sin_procesar ?? 0;
          (res.fallidas ?? []).forEach((fallida) =>
            fallidas.set(fallida.id, fallida)
          );
          this.progreso$.update((progreso) =>
            progreso ? { ...progreso, sincronizadas: procesadas } : progreso
          );
        },
        complete: () => {
          const resultado: ResultadoSincronizacion = {
            procesadas,
            fallidas: [...fallidas.values()],
            sin_procesar: sinProcesar,
          };
          this.resultado$.set(resultado);
          if (resultado.fallidas.length === 0 && procesadas > 0) {
            this._alertaService.mensajaExitoso(
              `${procesadas} entregas sincronizadas con Complemento`,
              'Sincronización completa'
            );
          }
        },
        error: () => {},
      });
  }
}
