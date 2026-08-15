import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { VisitaApiService } from '../../servicios/visita-api.service';
import { GeneralService } from '../../../../common/services/general.service';
import { ArchivosService } from '../../../../common/services/archivos.service';

@Component({
  selector: 'app-visita-detalle-drawer',
  standalone: true,
  imports: [CommonModule, DatePipe, RouterLink],
  templateUrl: './visita-detalle-drawer.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VisitaDetalleDrawerComponent implements OnChanges, OnDestroy {
  private _api = inject(VisitaApiService);
  private _cdr = inject(ChangeDetectorRef);
  private _router = inject(Router);
  private _generalService = inject(GeneralService);
  private _archivosService = inject(ArchivosService);

  @Input() abierto = false;
  @Input() visitaId: number | null = null;
  @Output() cerrar = new EventEmitter<void>();

  visita: any = null;
  cargando = false;
  error: string | null = null;
  /** Evidencias de la entrega (GenArchivo modelo=RutVisita) como object URLs. */
  evidenciaFotos: string[] = [];
  evidenciaFirmas: string[] = [];
  private _objectUrls: string[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['abierto']?.currentValue || changes['visitaId']?.currentValue) && this.abierto && this.visitaId) {
      this._cargar(this.visitaId);
    }
    if (changes['abierto'] && !this.abierto) {
      // Limpiar al cerrar para que el siguiente abrir muestre loading.
      this.visita = null;
      this._limpiarEvidencias();
    }
  }

  ngOnDestroy(): void {
    this._limpiarEvidencias();
  }

  private _cargar(id: number): void {
    this.cargando = true;
    this.error = null;
    this.visita = null;
    this._limpiarEvidencias();
    this._api.getDetalle(id).subscribe({
      next: (resp) => {
        this.visita = resp;
        this.cargando = false;
        this._cargarEvidencias(id);
        this._cdr.detectChanges();
      },
      error: (err) => {
        this.cargando = false;
        this.error = err?.error?.detail || err?.error?.mensaje || err?.message || 'Error al cargar la visita';
        this._cdr.detectChanges();
      },
    });
  }

  /** Fotos/firma de la entrega: lista de archivos del modelo + contenido como blob.
      Best-effort: si un archivo falla, se omite sin romper el drawer. */
  private _cargarEvidencias(visitaId: number): void {
    this._generalService
      .consultaApi<any>('general/archivo', { codigo: visitaId, modelo: 'RutVisita' })
      .subscribe((respuesta: any) => {
        const archivos: any[] = respuesta?.results ?? respuesta ?? [];
        for (const archivo of archivos) {
          this._archivosService.obtenerArchivoBlob(archivo.id).subscribe({
            next: (blob) => {
              const url = URL.createObjectURL(blob);
              this._objectUrls.push(url);
              // archivo_tipo_id 3 = firma (png); 2 = foto de evidencia (jpg).
              if (archivo.archivo_tipo_id === 3) {
                this.evidenciaFirmas = [...this.evidenciaFirmas, url];
              } else {
                this.evidenciaFotos = [...this.evidenciaFotos, url];
              }
              this._cdr.detectChanges();
            },
            error: () => {},
          });
        }
      });
  }

  private _limpiarEvidencias(): void {
    this._objectUrls.forEach((url) => URL.revokeObjectURL(url));
    this._objectUrls = [];
    this.evidenciaFotos = [];
    this.evidenciaFirmas = [];
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
      .filter((url): url is string => !!url)
      .concat(this.evidenciaFotos);
  }

  /** Datos de quien recibió: la app móvil los guarda en el JSON datos_entrega. */
  get recibe(): string | null {
    return this.visita?.recibe || this.visita?.datos_entrega?.recibe || null;
  }
  get recibeParentesco(): string | null {
    return this.visita?.recibeParentesco || this.visita?.datos_entrega?.recibeParentesco || null;
  }
  get recibeCelular(): string | null {
    return this.visita?.recibeCelular || this.visita?.datos_entrega?.recibeCelular || null;
  }
  get recibeNumeroIdentificacion(): string | null {
    return this.visita?.recibeNumeroIdentificacion || this.visita?.datos_entrega?.recibeNumeroIdentificacion || null;
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
