import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { EMPTY, expand, finalize } from 'rxjs';
import { ButtonComponent } from '../../../../common/components/ui/button/button.component';
import { AlertaService } from '../../../../common/services/alerta.service';
import {
  SincronizacionComplementoConfig,
  SincronizacionFallida,
  SincronizacionResumen,
} from '../../interfaces/sincronizacion-complemento.interface';

interface FallidaPresentada extends SincronizacionFallida {
  motivo: string;
  accion: string;
}

interface ResultadoSincronizacion {
  procesadas: number;
  fallidas: FallidaPresentada[];
  sin_procesar: number;
}

const RECHAZOS_CONOCIDOS: {
  patron: RegExp;
  motivo: string;
  accion: string;
}[] = [
  {
    patron: /no esta despachada/i,
    motivo: 'La guía aún no está despachada en Complemento.',
    accion:
      'Despache la guía (confirme su planilla) en Complemento; se reintentará automáticamente en la próxima sincronización.',
  },
  {
    patron: /guia no existe/i,
    motivo: 'La guía no existe en Complemento.',
    accion:
      'Verifique el número de guía en Complemento; pudo ser anulada o creada con otro número.',
  },
  {
    patron: /no tiene fecha de entrega/i,
    motivo: 'La visita quedó registrada en ruteo sin fecha de entrega.',
    accion: 'Revise la visita en ruteo y corrija la fecha de entrega.',
  },
  {
    patron: /error con la clase|conexion/i,
    motivo: 'No hubo comunicación con Complemento.',
    accion:
      'Verifique que Complemento esté en línea y vuelva a sincronizar; estos casos no descartan el registro.',
  },
];

@Component({
  selector: 'app-sincronizacion-complemento',
  standalone: true,
  imports: [ButtonComponent],
  templateUrl: './sincronizacion-complemento.component.html',
  styles: ':host { display: block; }',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SincronizacionComplementoComponent implements OnInit {
  private readonly _alertaService = inject(AlertaService);

  @Input({ required: true }) config!: SincronizacionComplementoConfig;

  public estaCargando$ = signal<boolean>(false);
  public resumen$ = signal<SincronizacionResumen | null>(null);
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
    this.config.obtenerResumen().subscribe((res) => {
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
    const fallidas = new Map<number, FallidaPresentada>();
    this.config
      .sincronizar(reiniciarDescartadas)
      .pipe(
        expand((res) =>
          res.procesadas > 0 && (res.sin_procesar ?? 0) > 0
            ? this.config.sincronizar(false)
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
            fallidas.set(fallida.id, this._presentarFallida(fallida))
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
              `${procesadas} ${this.config.unidad} sincronizadas con Complemento`,
              'Sincronización completa'
            );
          }
        },
        error: () => {},
      });
  }

  private _presentarFallida(
    fallida: SincronizacionFallida
  ): FallidaPresentada {
    const rechazo = RECHAZOS_CONOCIDOS.find((conocido) =>
      conocido.patron.test(fallida.mensaje)
    );
    return {
      ...fallida,
      motivo: rechazo?.motivo ?? fallida.mensaje,
      accion:
        rechazo?.accion ??
        'Reintente la sincronización; si persiste, contacte a soporte con el detalle del error.',
    };
  }
}
