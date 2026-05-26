import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { finalize, Subject, takeUntil } from 'rxjs';
import { General } from '../../../../common/clases/general';
import { VisitaApiService } from '../../servicios/visita-api.service';
import VisitaFormularioComponent from '../visita-formulario/visita-formulario.component';

@Component({
  selector: 'app-visita-editar',
  standalone: true,
  imports: [CommonModule, VisitaFormularioComponent],
  templateUrl: './visita-editar.component.html',
  styleUrl: './visita-editar.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class VisitaEditarComponent extends General implements OnInit, OnDestroy {
  private _visitaApiService = inject(VisitaApiService);
  private _activatedRoute = inject(ActivatedRoute);

  public informacionVisita: any = null;
  public cargandoDatos = signal<boolean>(true);
  private visitaId: number;
  private destroy$ = new Subject<void>();

  ngOnInit() {
    this.visitaId = Number(this._activatedRoute.snapshot.paramMap.get('id'));
    this.consultarVisita();
  }

  consultarVisita() {
    this.cargandoDatos.set(true);
    this._visitaApiService
      .getDetalle(this.visitaId)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.cargandoDatos.set(false);
          this.changeDetectorRef.detectChanges();
        })
      )
      .subscribe({
        next: (respuesta) => {
          this.informacionVisita = respuesta;
        },
        error: (error) => {
          this.alerta.mensajeError(
            'Error al cargar la información de la visita',
            'Error'
          );
          this.router.navigate(['/movimiento/visita/lista']);
        },
      });
  }

  enviarFormulario(formulario: any) {
    this._visitaApiService
      .actualizar(this.visitaId, formulario)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.alerta.mensajaExitoso('Se ha actualizado la visita exitosamente.');
          this.router.navigate(['/movimiento/visita/lista']);
        },
        error: (err) => {
          console.error('[visita.actualizar] error:', err);
          const status = err?.status ?? 0;
          let titulo = 'Error al actualizar la visita';
          let mensaje =
            err?.error?.detail || err?.error?.mensaje || 'Intenta nuevamente.';
          const validaciones = err?.error?.validaciones;
          if (status === 400 && validaciones && typeof validaciones === 'object') {
            const detalles = Object.entries(validaciones)
              .map(([campo, errs]) => {
                const errores = Array.isArray(errs) ? errs.join(', ') : String(errs);
                return `<strong>${campo}</strong>: ${errores}`;
              })
              .join('<br/>');
            if (detalles) mensaje = detalles;
          } else if (status === 403) {
            titulo = 'Sin permiso';
            mensaje = 'Tu rol no permite editar visitas.';
          } else if (status === 0) {
            if (typeof navigator !== 'undefined' && navigator.onLine === false) {
              titulo = 'Sin conexión';
              mensaje = 'Revisa tu conexión a internet.';
            } else {
              titulo = 'No pudimos contactar al servidor';
              mensaje = 'Intenta de nuevo o contacta a soporte.';
            }
          }
          this.alerta.mensajeError(titulo, mensaje);
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
