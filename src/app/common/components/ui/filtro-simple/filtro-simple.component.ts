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

/** La primera opción de la lista debe ser la de "todas" con params vacíos ({}). */
export interface EstadoOpcion {
  label: string;
  params: Record<string, any>;
}

@Component({
  selector: 'app-filtro-simple',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './filtro-simple.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FiltroSimpleComponent implements OnInit, OnDestroy {
  @Input() placeholder = 'Buscar…';
  @Input() conFecha = true;
  /** Ej: 'despacho__fecha' para filtrar por día de ruta en vez de fecha de ingreso. */
  @Input() campoFecha = 'fecha';
  /** Vacío = no se muestra el selector de Estado. */
  @Input() estados: EstadoOpcion[] = [];
  /** Vacío = no persiste el filtro entre visitas. */
  @Input() localStorageKey = '';

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
    // setTimeout: evita un detectChanges reentrante durante el ngOnInit del padre (rompía con OnPush).
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

  private _diaSiguiente(iso: string): string {
    // Date.UTC evita el corrimiento de día por zona horaria local.
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
