import {
  Directive,
  inject,
  Input,
  OnDestroy,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { Subject, takeUntil } from 'rxjs';
import { obtenerPuedeEscribir } from '../../redux/selectors/contenedor.selector';

/**
 * Renderiza el contenido solo si el usuario tiene permiso para escribir en el contenedor activo.
 * Admin y perfiles 'operativo' / 'supervisor' pueden. 'consulta' no.
 *
 * Uso:
 *   <button *appPuedeEscribir>Crear</button>
 *   <button *appPuedeEscribir="false">Vista solo lectura</button>
 */
@Directive({
  selector: '[appPuedeEscribir]',
  standalone: true,
})
export class PuedeEscribirDirective implements OnDestroy {
  private templateRef = inject(TemplateRef<unknown>);
  private viewContainer = inject(ViewContainerRef);
  private store = inject(Store);

  private _destroy$ = new Subject<void>();
  private _expected = true;
  private _ultimoEstado: boolean | null = null;

  @Input() set appPuedeEscribir(valor: boolean | '' | undefined) {
    this._expected = valor === false ? false : true;
    this._evaluar(this._ultimoEstado);
  }

  ngOnInit() {
    this.store
      .select(obtenerPuedeEscribir)
      .pipe(takeUntil(this._destroy$))
      .subscribe((puede) => {
        this._ultimoEstado = !!puede;
        this._evaluar(this._ultimoEstado);
      });
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  private _evaluar(puede: boolean | null) {
    if (puede === null) return;
    const debeMostrar = this._expected ? puede : !puede;
    this.viewContainer.clear();
    if (debeMostrar) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    }
  }
}
