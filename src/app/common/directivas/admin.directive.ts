import {
  Directive,
  inject,
  Input,
  TemplateRef,
  ViewContainerRef,
  OnDestroy,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { Subject, takeUntil } from 'rxjs';
import { obtenerEsAdminContenedor } from '../../redux/selectors/contenedor.selector';

/**
 * Renderiza el elemento solo si el usuario es admin del contenedor activo.
 * Uso:  <div *appAdmin>...</div>
 *       <div *appAdmin="false">...</div>  (renderiza solo si NO es admin)
 */
@Directive({
  selector: '[appAdmin]',
  standalone: true,
})
export class AdminDirective implements OnDestroy {
  private templateRef = inject(TemplateRef<unknown>);
  private viewContainer = inject(ViewContainerRef);
  private store = inject(Store);

  private _destroy$ = new Subject<void>();
  private _expected = true;
  private _ultimoEstado: boolean | null = null;

  @Input() set appAdmin(valor: boolean | '' | undefined) {
    // Por defecto (sin valor o vacío): renderizar si es admin
    this._expected = valor === false ? false : true;
    this._evaluar(this._ultimoEstado);
  }

  ngOnInit() {
    this.store
      .select(obtenerEsAdminContenedor)
      .pipe(takeUntil(this._destroy$))
      .subscribe((esAdmin) => {
        this._ultimoEstado = !!esAdmin;
        this._evaluar(this._ultimoEstado);
      });
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  private _evaluar(esAdmin: boolean | null) {
    if (esAdmin === null) return;
    const debeMostrar = this._expected ? esAdmin : !esAdmin;
    this.viewContainer.clear();
    if (debeMostrar) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    }
  }
}
