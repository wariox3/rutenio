import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { VisitaApiService } from '../../servicios/visita-api.service';

@Component({
  selector: 'app-visita-detalle-drawer',
  standalone: true,
  imports: [CommonModule, DatePipe, RouterLink],
  templateUrl: './visita-detalle-drawer.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VisitaDetalleDrawerComponent implements OnChanges {
  private _api = inject(VisitaApiService);
  private _cdr = inject(ChangeDetectorRef);
  private _router = inject(Router);

  @Input() abierto = false;
  @Input() visitaId: number | null = null;
  @Output() cerrar = new EventEmitter<void>();

  visita: any = null;
  cargando = false;
  error: string | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['abierto']?.currentValue || changes['visitaId']?.currentValue) && this.abierto && this.visitaId) {
      this._cargar(this.visitaId);
    }
    if (changes['abierto'] && !this.abierto) {
      // Limpiar al cerrar para que el siguiente abrir muestre loading.
      this.visita = null;
    }
  }

  private _cargar(id: number): void {
    this.cargando = true;
    this.error = null;
    this.visita = null;
    this._api.getDetalle(id).subscribe({
      next: (resp) => {
        this.visita = resp;
        this.cargando = false;
        this._cdr.detectChanges();
      },
      error: (err) => {
        this.cargando = false;
        this.error = err?.error?.detail || err?.error?.mensaje || err?.message || 'Error al cargar la visita';
        this._cdr.detectChanges();
      },
    });
  }

  onCerrar(): void {
    this.cerrar.emit();
  }

  /** Estado dominante visible como badge en el header. */
  get estadoDominante(): 'novedad' | 'entregado' | 'despachado' | 'pendiente' {
    if (this.visita?.estado_novedad) return 'novedad';
    if (this.visita?.estado_entregado) return 'entregado';
    if (this.visita?.estado_despacho) return 'despachado';
    return 'pendiente';
  }

  /** URLs de fotos de evidencia. El backend puede exponerlas en distintos campos
      según el endpoint; recolectamos todos los formatos conocidos y filtramos vacíos. */
  get fotos(): string[] {
    if (!this.visita) return [];
    const candidatos: any[] = []
      .concat(this.visita.imagenes ?? [])
      .concat(this.visita.fotos ?? [])
      .concat(this.visita.evidencias ?? []);
    return candidatos
      .map((f) => (typeof f === 'string' ? f : f?.url || f?.imagen || f?.archivo))
      .filter((url): url is string => !!url);
  }

  abrirPaginaCompleta(): void {
    if (!this.visitaId) return;
    this._router.navigateByUrl(`/movimiento/visita/detalle/${this.visitaId}`);
    this.cerrar.emit();
  }

  irAEditar(): void {
    if (!this.visitaId) return;
    if (this.visita?.estado_entregado) return;
    this._router.navigateByUrl(`/movimiento/visita/editar/${this.visitaId}`);
    this.cerrar.emit();
  }
}
