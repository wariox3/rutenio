import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, takeUntil } from 'rxjs';

/** Una opción del selector de Estado. `params` son los query-params que se
 *  aplican tal cual al backend (ej. { estado_entregado: true }). La primera
 *  opción de la lista debe ser la de "todas" con params vacíos ({}). */
export interface EstadoOpcion {
  label: string;
  params: Record<string, any>;
}

/**
 * Barra de filtros simple para listas operativas: un buscador de texto libre
 * (debounced), un rango de fechas Desde/Hasta y un selector de Estado
 * configurable. Reemplaza al armador genérico `app-filtro` (campo + operador +
 * valor) en las páginas donde el operador solo necesita "buscar algo entre estas
 * fechas". Emite un objeto de query-params listo para pasar al backend.
 *
 * - buscar    -> ?buscar=<texto>   (el backend hace el OR multi-campo)
 * - rango      -> ?fecha__gte=<desde>&fecha__lt=<hasta+1 día>
 *                 (el +1 día incluye TODO el día "hasta"; evita el bug de que
 *                  fecha__lte a medianoche recortaba el último día)
 * - estado     -> los params de la EstadoOpcion elegida
 */
@Component({
  selector: 'app-filtro-simple',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './filtro-simple.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FiltroSimpleComponent implements OnInit, OnDestroy {
  /** Placeholder del buscador (qué campos matchea, en lenguaje del operador). */
  @Input() placeholder = 'Buscar…';
  /** Muestra/oculta el rango de fechas. */
  @Input() conFecha = true;
  /** Campo por el que aplica el rango de fechas. Por defecto 'fecha' (ingreso);
   *  el informe de entregas por despacho usa 'despacho__fecha' (día de ruta). */
  @Input() campoFecha = 'fecha';
  /** Opciones del selector de Estado. Vacío = no se muestra el selector. */
  @Input() estados: EstadoOpcion[] = [];
  /** Clave de localStorage para recordar el filtro entre visitas. Vacío = no persiste. */
  @Input() localStorageKey = '';

  /** Emite los query-params cada vez que cambia el filtro (incluido el estado inicial restaurado). */
  @Output() aplicar = new EventEmitter<Record<string, any>>();

  buscar = '';
  desde = '';
  hasta = '';
  estadoIndex = 0;

  private _buscar$ = new Subject<void>();
  private _destroy$ = new Subject<void>();

  ngOnInit(): void {
    this._restaurar();
    this._buscar$
      .pipe(debounceTime(350), takeUntil(this._destroy$))
      .subscribe(() => this._emitir());
    // La carga inicial la hace la PÁGINA en su ngOnInit. Aquí solo re-aplicamos
    // el filtro guardado en localStorage (si lo hay), y DIFERIDO (setTimeout)
    // para no disparar un detectChanges reentrante durante el init del padre
    // (que bajo OnPush rompía la primera carga).
    if (this.hayFiltro) {
      setTimeout(() => this._emitir(false), 0);
    }
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  onBuscarInput(valor: string): void {
    this.buscar = valor;
    this._buscar$.next();
  }

  onFechaChange(): void {
    this._emitir();
  }

  onEstadoChange(index: number): void {
    this.estadoIndex = Number(index) || 0;
    this._emitir();
  }

  limpiar(): void {
    this.buscar = '';
    this.desde = '';
    this.hasta = '';
    this.estadoIndex = 0;
    this._emitir();
  }

  get hayFiltro(): boolean {
    return !!(this.buscar.trim() || this.desde || this.hasta || this.estadoIndex > 0);
  }

  private _emitir(persistir = true): void {
    const params: Record<string, any> = {};
    const texto = this.buscar.trim();
    if (texto) params['buscar'] = texto;
    if (this.conFecha) {
      if (this.desde) params[`${this.campoFecha}__gte`] = this.desde;
      if (this.hasta) params[`${this.campoFecha}__lt`] = this._diaSiguiente(this.hasta);
    }
    const estado = this.estados[this.estadoIndex];
    if (estado?.params) Object.assign(params, estado.params);
    if (persistir) this._persistir();
    this.aplicar.emit(params);
  }

  /** 'YYYY-MM-DD' -> día siguiente 'YYYY-MM-DD', sin corrimiento por zona horaria. */
  private _diaSiguiente(iso: string): string {
    const [y, m, d] = iso.split('-').map(Number);
    const dt = new Date(Date.UTC(y, m - 1, d));
    dt.setUTCDate(dt.getUTCDate() + 1);
    return dt.toISOString().slice(0, 10);
  }

  private _persistir(): void {
    if (!this.localStorageKey || typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(
        this.localStorageKey,
        JSON.stringify({
          buscar: this.buscar,
          desde: this.desde,
          hasta: this.hasta,
          estadoIndex: this.estadoIndex,
        })
      );
    } catch {
      /* storage lleno o bloqueado: el filtro sigue funcionando en memoria */
    }
  }

  private _restaurar(): void {
    if (!this.localStorageKey || typeof localStorage === 'undefined') return;
    try {
      const raw = localStorage.getItem(this.localStorageKey);
      if (!raw) return;
      const guardado = JSON.parse(raw) || {};
      this.buscar = typeof guardado.buscar === 'string' ? guardado.buscar : '';
      this.desde = typeof guardado.desde === 'string' ? guardado.desde : '';
      this.hasta = typeof guardado.hasta === 'string' ? guardado.hasta : '';
      const idx = Number(guardado.estadoIndex);
      this.estadoIndex = Number.isInteger(idx) && idx >= 0 && idx < this.estados.length ? idx : 0;
    } catch {
      /* json corrupto: arranca sin filtro */
    }
  }
}
