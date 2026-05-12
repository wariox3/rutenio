import {
  Directive,
  inject,
  Input,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { Subject, takeUntil } from 'rxjs';
import { obtenerPermisoPor } from '../../redux/selectors/contenedor.selector';

/**
 * Renderiza el contenido si el usuario tiene el permiso indicado en el contenedor activo.
 * El input es una cadena `modulo.accion` (ej: 'visita.editar', 'vehiculo.ver').
 *
 * Uso:
 *   <button *appPermisoPor="'visita.editar'">Editar</button>
 *   <button *appPermisoPor="'visita.ver'">Ver</button>
 */
@Directive({
  selector: '[appPermisoPor]',
  standalone: true,
})
export class PermisoPorDirective implements OnInit, OnDestroy {
  private templateRef = inject(TemplateRef<unknown>);
  private viewContainer = inject(ViewContainerRef);
  private store = inject(Store);

  private _destroy$ = new Subject<void>();
  private _modulo: string = '';
  private _accion: 'ver' | 'editar' = 'ver';

  @Input({ required: true }) set appPermisoPor(valor: string) {
    const [modulo, accion] = (valor || '').split('.') as [string, 'ver' | 'editar'];
    this._modulo = modulo || '';
    this._accion = accion === 'editar' ? 'editar' : 'ver';
    this._suscribir();
  }

  ngOnInit() {
    if (this._modulo) this._suscribir();
  }

  ngOnDestroy() {
    this._destroy$.next();
    this._destroy$.complete();
  }

  private _suscribir() {
    if (!this._modulo) return;
    this._destroy$.next();
    this.store
      .select(obtenerPermisoPor(this._modulo, this._accion))
      .pipe(takeUntil(this._destroy$))
      .subscribe((puede) => {
        this.viewContainer.clear();
        if (puede) {
          this.viewContainer.createEmbeddedView(this.templateRef);
        }
      });
  }
}
